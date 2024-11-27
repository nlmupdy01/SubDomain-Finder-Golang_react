// import React, { useState } from "react";
// import axios from "axios";

// const App = () => {
//   const [domain, setDomain] = useState("");
//   const [results, setResults] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleScan = async () => {
//     if (!domain) {
//       alert("Please enter a domain");
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await axios.get("http://localhost:8080/scan?domain=" + domain);
//       setResults(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       alert("Error fetching data. Check the backend or API call.");
//     }
//     setLoading(false);
//   };

//   return (
//     <div>
//       <h1>Domain Scanner</h1>
//       <input

//         type="text"
//         value={domain}
//         onChange={(e) => setDomain(e.target.value)}
//         placeholder="Enter domain"
//       />
//       <button onClick={handleScan}>{loading ? "Scanning..." : "Scan"}</button>
//       {results && (
//         <div>
//           <h3>Subdomains</h3>
//           <ul>
//             {results.subdomains.map((sub, index) => (
//               <li key={index}>{sub}</li>
//             ))}
//           </ul>
//           <h3>Open Ports</h3>
//           <ul>
//             {results.open_ports.map((port, index) => (
//               <li key={index}>{port}</li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;
// import React, { useState } from "react";
// import axios from "axios";
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import { Box, Container,  List, ListItem, ListItemText, Typography } from "@mui/material";
// import Divider from '@mui/material/Divider';


// const App = () => {
//   const [domain, setDomain] = useState("");
//   const [results, setResults] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleScan = async () => {
//     if (!domain) {
//       alert("Please enter a domain");
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await axios.get("http://localhost:8080/scan?domain=" + domain);
//       setResults(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       alert("Error fetching data. Check the backend or API call.");
//     }
//     setLoading(false);
//   };

//   return (
//     <>
   
//     <Container style={{paddingLeft:'350px'}}>
//     <Box>
//       <Typography variant="h5" gutterBottom  color="#454545">
//       Domain Scanner
//       </Typography>

//       <TextField id="standard-basic" label="Domain Name" variant="standard"   type="text" sx={{width:'25rem'}}
//         value={domain}
//         onChange={(e) => setDomain(e.target.value)}
//         placeholder="Enter domain"/>
//       {/* <input

//         type="text"
//         value={domain}
//         onChange={(e) => setDomain(e.target.value)}
//         placeholder="Enter domain"
//       /> */}
      
//       <Button size="medium" color="error" sx={{marginTop:1.5,marginLeft:3,width:"7rem"}} variant="contained" onClick={handleScan}>{loading ? "Scanning..." : "Scan"}</Button>
//       {results && (
//         <div>
//           <Typography variant="h5" gutterBottom  color="#454545">Sub-Domains List</Typography>
//           <List sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}>
         

//             {results.subdomains.map((sub, index) => (
//                <ListItem>

//               <ListItemText key={index}>{sub}
//               <Divider component="li" />
//               </ListItemText>
             

//               </ListItem>
              
//             ))}
//           </List>
//           <Typography variant="h5" gutterBottom  mt={3} color="#454545">Open Ports </Typography>
          
// <List sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}>
//             {results.open_ports.map((port, index) => (
//               <ListItem>
//               <ListItemText key={index}>{port}

//               <Divider component="li" />

//               </ListItemText>

//               </ListItem>
//             ))}
//                         </List>

//         </div>
//       )}
//       </Box>
//       </Container>
    
//     </>
//   );
// };

// export default App;

import React, { useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {  List, Typography } from "@mui/material";
import "./App.css";

function App() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setDomain(e.target.value);
  };

  const handleScan = async () => {
    if (!domain) {
      setError("Please enter a valid domain.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/scan?domain=${domain}`);
      if (!response.ok) {
        throw new Error("Failed to fetch scan results. Please check the domain or server.");
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="App">
        <Typography variant="h5" gutterBottom  color="#454545">Subdomain and Port Scanner</Typography>
      <TextField id="standard-basic" label="Domain Name" variant="standard"   type="text" sx={{width:'25rem'}}
        
          placeholder="Enter domain (e.g., example.com)"
          value={domain}
          onChange={handleInputChange}
        />
        <Button size="medium" color="error" sx={{marginTop:1.5,marginLeft:3,width:"7rem"}} variant="contained"  onClick={handleScan} disabled={loading}>
          {loading ? "Scanning..." : "Scan"}
        </Button>
                 <List sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper', marginLeft:'300px'}}>

      {error && <div className="error">{error}</div>}
      {result && (
        
        <div className="results">
            <Typography variant="h5" gutterBottom  mt={3} color="#454545">Scan Results</Typography>
            <Typography variant="h5" gutterBottom  mt={3} color="#454545">Subdomains</Typography>
          <ol>
            {result.subdomains.map((sub, index) => (
              <li key={index}>{sub}</li>
            ))}
          </ol>
          <Typography variant="h5" gutterBottom  mt={3} color="#454545">Open Ports</Typography>
          <ol>
            {result.open_ports.map((port, index) => (
              <li key={index}>Port {port}</li>
            ))}
          </ol>
          
        </div>
      )}
          </List>

    </div>

  );
}

export default App

