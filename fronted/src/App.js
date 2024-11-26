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
import React, { useState } from "react";
import axios from "axios";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Box, Container,  List, ListItem, ListItemText, Typography } from "@mui/material";
import Divider from '@mui/material/Divider';


const App = () => {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!domain) {
      alert("Please enter a domain");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/scan?domain=" + domain);
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data. Check the backend or API call.");
    }
    setLoading(false);
  };

  return (
    <>
   
    <Container style={{paddingLeft:'350px'}}>
    <Box>
      <Typography variant="h5" gutterBottom  color="#454545">
      Domain Scanner
      </Typography>

      <TextField id="standard-basic" label="Domain Name" variant="standard"   type="text" sx={{width:'25rem'}}
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Enter domain"/>
      {/* <input

        type="text"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="Enter domain"
      /> */}
      
      <Button size="medium" color="error" sx={{marginTop:1.5,marginLeft:3,width:"7rem"}} variant="contained" onClick={handleScan}>{loading ? "Scanning..." : "Scan"}</Button>
      {results && (
        <div>
          <Typography variant="h5" gutterBottom  color="#454545">Sub-Domains List</Typography>
          <List sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}>
         

            {results.subdomains.map((sub, index) => (
               <ListItem>

              <ListItemText key={index}>{sub}
              <Divider component="li" />
              </ListItemText>
             

              </ListItem>
              
            ))}
          </List>
          <Typography variant="h5" gutterBottom  mt={3} color="#454545">Open Ports </Typography>
          
<List sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}>
            {results.open_ports.map((port, index) => (
              <ListItem>
              <ListItemText key={index}>{port}

              <Divider component="li" />

              </ListItemText>

              </ListItem>
            ))}
                        </List>

        </div>
      )}
      </Box>
      </Container>
    
    </>
  );
};

export default App;


