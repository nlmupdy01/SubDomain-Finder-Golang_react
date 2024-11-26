package main

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os/exec"
	"strings"
	"sync"

	"github.com/rs/cors"
)

type ScanResult struct {
	Subdomains []string `json:"subdomains"`
	OpenPorts  []int    `json:"open_ports"`
}

func getSubdomains(domain string) ([]string, error) {
	// Execute Subfinder CLI
	cmd := exec.Command("subfinder", "-d", domain, "-silent")
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("error running subfinder: %v", err)
	}

	subdomains := strings.Split(string(output), "\n")
	// Remove empty entries
	filtered := []string{}
	for _, subdomain := range subdomains {
		if subdomain != "" {
			filtered = append(filtered, subdomain)
		}
	}
	return filtered, nil
}

func scanPorts(domain string, ports []int) []int {
	var openPorts []int
	var wg sync.WaitGroup
	var mu sync.Mutex

	for _, port := range ports {
		wg.Add(1)
		go func(port int) {
			defer wg.Done()
			address := fmt.Sprintf("%s:%d", domain, port)
			conn, err := net.Dial("tcp", address)
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

func handler(w http.ResponseWriter, r *http.Request) {
	domain := r.URL.Query().Get("domain")
	if domain == "" {
		http.Error(w, "Domain is required", http.StatusBadRequest)
		return
	}

	// Fetch subdomains
	subdomains, err := getSubdomains(domain)
	if err != nil {
		http.Error(w, "Error fetching subdomains", http.StatusInternalServerError)
		return
	}

	// Scan open ports (common ports)
	ports := []int{80, 443, 8080, 8443, 22, 21}
	openPorts := scanPorts(domain, ports)

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

	// Enable CORS for all origins
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // React app origin
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(r)
	fmt.Println("Server is running on port 8080...")
	http.ListenAndServe(":8080", handler)
}
