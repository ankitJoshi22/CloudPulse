import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TablePagination,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Box
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const projectIds = ["springboot-access-452911", "crack-fold-452309-d4", "cloud-access-452309"];
const apiStatusConstants = {
  INITIAL: "INITIAL",
  IN_PROGRESS: "IN_PROGRESS",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
};

const ResourcesDashboard = () => {
  const [resources, setResources] = useState({});
  const [selectedProject, setSelectedProject] = useState(projectIds[0]);
  const [expandedServices, setExpandedServices] = useState({});
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.INITIAL);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async (projectId) => {
    try {
      setApiStatus(apiStatusConstants.IN_PROGRESS);
      setError(null);

      const response = await fetch(`http://localhost:8080/projects/${projectId}/all-resources`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      console.log(data)

      setResources(data || {});
      setApiStatus(apiStatusConstants.SUCCESS);
    } catch (err) {
      setError("Failed to load resource data. Please try again.");
      setApiStatus(apiStatusConstants.FAILURE);
    }
  };


  useEffect(() => {
    if (selectedProject) fetchData(selectedProject);
  }, [selectedProject]);

  const toggleService = (service) => {
    // console.log(service);
    // console.log(expandedServices)
    setExpandedServices((prev) => ({ ...prev, [service]: !prev[service] }));
  };

  const handlePageChange = (service, newPage) => {
    setPagination((prev) => ({ ...prev, [service]: { ...prev[service], page: newPage } }));
  };

  const handleRowsPerPageChange = (service, event) => {
    setPagination((prev) => ({
      ...prev,
      [service]: { rowsPerPage: parseInt(event.target.value, 10), page: 0 }
    }));
  };

  const filteredResources = Object.keys(resources).reduce((acc, service) => {
    const filtered = resources[service].filter((res) =>
      (statusFilter ? res.state.toLowerCase() === statusFilter.toLowerCase() : true) &&
      (searchTerm ? res.displayName.toLowerCase().includes(searchTerm.toLowerCase()) : true)
    );
    if (filtered.length > 0) acc[service] = filtered;
    return acc;
  }, {});

  return (
    <Container sx={{ mt: 3 }}>
      <Typography variant="h5" mb={4} fontWeight="bold">LBG CloudPulse Resources</Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Select sx={{mb:3, backgroundColor:"#006a4d", color: "white",
               "& .MuiSelect-icon": { color: "white" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#006a4d" }, // Default outline color
               "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#004d36" }, // Darker shade on hover
               "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#006a4d" }, // Change color when focused
           }} fontWeight= "bold" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
          {projectIds.map((proj) => (
            <MenuItem key={proj} value={proj}>{proj}</MenuItem>
          ))}
        </Select>
        <Box > 
        <TextField placeholder="Search by Resource Name..." variant="outlined"  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}  sx={{
    mb: 2, 
    mx: 2,  
    "& .MuiOutlinedInput-root": {
      color: "#006a4d", // Input text color
      "& fieldset": { borderColor: "#006a4d" }, // Default border color
      "&:hover fieldset": { borderColor: "#004d36" }, // Darker on hover
      "&.Mui-focused fieldset": { borderColor: "#006a4d" }, // Keep border color on focus
    },
    "& .MuiInputBase-input": {
      color: "#006a4d", // Text color inside input
      "&::placeholder": { color: "#006a4d", opacity: 1 }, // Placeholder color
    }
  }} />
         <Select value={statusFilter} sx={{mb:3, backgroundColor:"#006a4d", color: "white",
               "& .MuiSelect-icon": { color: "white" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#006a4d" }, // Default outline color
               "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#004d36" }, // Darker shade on hover
               "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#006a4d" }, // Change color when focused
    }} fontWeight= "bold" onChange={(e) => setStatusFilter(e.target.value)} displayEmpty >
        <MenuItem value="">All Statuses</MenuItem>
        <MenuItem value="Running">Running</MenuItem>
        <MenuItem value="Stopped">Stopped</MenuItem>
        <MenuItem value="Available">Available</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
      </Select>  
        </Box>
      </Box>

      {apiStatus === apiStatusConstants.IN_PROGRESS && 
            <Box height={"70vh"} display="flex" justifyContent="center" alignItems="center" flexDirection="column" sx={{ mb: 2 }}>
              {apiStatus === apiStatusConstants.IN_PROGRESS && <CircularProgress sx={{color:"#006a4d"}} />}
              {apiStatus === apiStatusConstants.FAILURE && (
                <>
                  <Alert severity="error">{error}</Alert>
                  <Button variant="contained" backgroundColor="#006a4d" onClick={fetchData} sx={{ marginTop: 2 }}>
                    Retry
                  </Button>
                </>
              )}
            </Box>
      } 

      { Object.keys(filteredResources).map((service) => { 
         const page = pagination[service]?.page || 0;
         const rowsPerPage = pagination[service]?.rowsPerPage || 5;
          const serviceResources = filteredResources[service];
        return (

        <Paper key={service} sx={{ mb: 3, p: 2, border:"1px solid #aaaaaa"}}>
          <Typography variant="h6" fontWeight={"bold"}>
            <IconButton onClick={() => toggleService(service)}>
              {expandedServices[service] ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
            {service.charAt(0).toUpperCase() + service.slice(1)} Services
          </Typography>
          <Collapse in={expandedServices[service]}>
          {/* Table Header*/}
            <Table>
              <TableHead>
                <TableRow>
                <TableCell sx={{backgroundColor:"#006a4d", color:"white"}}>ID</TableCell>
                  <TableCell sx={{backgroundColor:"#006a4d", color:"white"}}>Name</TableCell>
                  <TableCell sx={{backgroundColor:"#006a4d", color:"white"}}>Type</TableCell>
                  <TableCell sx={{backgroundColor:"#006a4d", color:"white"}}>Status</TableCell>
                  <TableCell sx={{backgroundColor:"#006a4d", color:"white"}}>Location</TableCell>
                  <TableCell sx={{backgroundColor:"#006a4d", color:"white"}}>CreatedDate</TableCell>
                  <TableCell sx={{backgroundColor:"#006a4d", color:"white"}}>Actions</TableCell>
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {filteredResources[service].slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((resource) => (
                  <TableRow key={resource.name} sx={{ backgroundColor: "#dee0df" }}>
                    <TableCell>{resource.additionalAttributes?.id || "N/A"}</TableCell>
                    <TableCell>{resource.displayName || "N/A"}</TableCell>
                    <TableCell>{resource.assetType.split('/')[1] || "N/A"}</TableCell>
                    <TableCell>{resource.state || "N/A"}</TableCell>
                    <TableCell>{resource.location || "N/A"}</TableCell>
                    <TableCell>{resource.createTime || "N/A"}</TableCell>
                    <TableCell>
                      
                    <Button sx={{backgroundColor:"#006a4d", color:"white"}} size="small" onClick={() => navigate(`/resource/${resource.project.split('/')[1]}`, { state: { resource } })}>View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination */}
            <TablePagination
                sx={{
                  "& .MuiTablePagination-root": { color: "black" }, // Applies to the main root container
                  "& .MuiTablePagination-selectLabel": { color: "black" }, // "Rows per page" text
                  "& .MuiSelect-icon": { color: "black" }, // Dropdown arrow icon
                  "& .MuiTablePagination-displayedRows": { color: "black" }, // Page info (e.g., 1-5 of 50)
                  "& .MuiIconButton-root": { color: "black" }, 
                  color:"black",
                }}
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={serviceResources.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => handlePageChange(service, newPage)}
                onRowsPerPageChange={(e) => handleRowsPerPageChange(service, e)}
              />
          </Collapse>
        </Paper>
      );
    }
      )}
    </Container>
  );
};

export default ResourcesDashboard;
