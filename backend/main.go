package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/rs/cors"
)

type ScanResult struct {
	Subdomains []string `json:"subdomains"`
	OpenPorts  []int    `json:"open_ports"`
}

// Get subdomains using Subfinder CLI
func getSubdomains(domain string) ([]string, error) {
	cmd := exec.Command("subfinder", "-d", domain, "-silent")
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("error running subfinder: %v", err)
	}

	subdomains := strings.Split(string(output), "\n")
	filtered := []string{}
	for _, subdomain := range subdomains {
		subdomain = strings.TrimSpace(subdomain)
		if subdomain != "" {
			filtered = append(filtered, subdomain)
		}
	}
	return filtered, nil
}

// Scan specified ports on a domain
func scanPorts(domain string, ports []int) []int {
	var openPorts []int
	var wg sync.WaitGroup
	var mu sync.Mutex
	workerLimit := make(chan struct{}, 10) // Limit concurrency to 10 workers

	for _, port := range ports {
		wg.Add(1)
		workerLimit <- struct{}{} // Acquire a worker slot
		go func(port int) {
			defer wg.Done()
			defer func() { <-workerLimit }() // Release the worker slot

			address := fmt.Sprintf("%s:%d", domain, port)
			conn, err := net.DialTimeout("tcp", address, 3*time.Second) // Set timeout
			if err == nil {
				conn.Close()
				mu.Lock()
				openPorts = append(openPorts, port)
				mu.Unlock()
			}
		}(port)
	}
	wg.Wait()
	return openPorts
}

// Validate domain format
func validateDomain(domain string) error {
	if strings.TrimSpace(domain) == "" {
		return errors.New("domain is empty")
	}
	if !strings.Contains(domain, ".") {
		return errors.New("invalid domain format")
	}
	return nil
}

// HTTP Handler for /scan endpoint
func handler(w http.ResponseWriter, r *http.Request) {
	domain := r.URL.Query().Get("domain")
	if err := validateDomain(domain); err != nil {
		http.Error(w, fmt.Sprintf("Invalid domain: %v", err), http.StatusBadRequest)
		return
	}

	// Fetch subdomains
	subdomains, err := getSubdomains(domain)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error fetching subdomains: %v", err), http.StatusInternalServerError)
		return
	}

	// Scan open ports
	commonPorts := []int{80, 443, 8080, 8443, 22, 21}
	openPorts := scanPorts(domain, commonPorts)

	// Send response
	result := ScanResult{
		Subdomains: subdomains,
		OpenPorts:  openPorts,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func main() {
	r := http.NewServeMux()
	r.HandleFunc("/scan", handler)

	// Enable CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Update as needed
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(r)
	fmt.Println("Server is running on port 8080...")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}
