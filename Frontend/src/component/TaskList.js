// import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
// import { useQuery, useLazyQuery, gql } from "@apollo/client";
// import { DataGrid } from "@mui/x-data-grid";
// import { TextField, Box, InputAdornment, CircularProgress, Typography, Chip, Button, Tooltip } from "@mui/material";
// import { Search, Refresh, RotateRight } from "@mui/icons-material";
// import debounce from "lodash/debounce";

// // Use the correct unified paginated query
// const GET_PAGINATED_TASKS = gql`
//   query GetPaginatedTasks($page: Int!, $size: Int!) {
//     getPaginatedTasks(page: $page, size: $size) {
//       tasks {
//         id
//         jid
//         articleId
//         taskName
//         user
//         dueDate
//         receivedDate
//         journalComplexity
//         department
//         taskId
//         customer
//       }
//       totalCount
//     }
//   }
// `;

// const TaskList = () => {
//   // Pagination state
//   const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
//   const [searchText, setSearchText] = useState("");
//   const [debouncedSearchText, setDebouncedSearchText] = useState("");
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [totalCount, setTotalCount] = useState(0);
  
//   // Cache for pagination data - store pages with timestamps
//   const pagesCache = useRef(new Map());
//   // Track what pages are being fetched
//   const fetchingPages = useRef(new Set());
//   // Cache entry expiration time (1 minute)
//   const CACHE_EXPIRATION_MS = 60000;
//   // Cache size for more real-time data
//   const MAX_CACHE_SIZE = 5;
  
//   // Main query for current page
//   const { loading, error, data, refetch } = useQuery(GET_PAGINATED_TASKS, {
//     variables: { 
//       page: paginationModel.page, 
//       size: paginationModel.pageSize 
//     },
//     fetchPolicy: "network-only", // Force network on refresh
//     notifyOnNetworkStatusChange: true,
//     onCompleted: (data) => {
//       const now = new Date();
//       setLastUpdated(now);
//       setIsRefreshing(false);
      
//       if (data?.getPaginatedTasks) {
//         // Update total count
//         setTotalCount(data.getPaginatedTasks.totalCount);
        
//         // Cache this page with timestamp
//         const pageKey = `${paginationModel.page}-${paginationModel.pageSize}`;
//         pagesCache.current.set(pageKey, {
//           data: data.getPaginatedTasks.tasks,
//           timestamp: now.getTime(),
//           fresh: true
//         });
        
//         // Remove from fetching set
//         fetchingPages.current.delete(pageKey);
//       }
//     }
//   });

//   // Generic function to fetch any page
//   const [fetchPage] = useLazyQuery(GET_PAGINATED_TASKS, {
//     fetchPolicy: "network-only",
//     onCompleted: (data) => {
//       if (data?.getPaginatedTasks?.tasks) {
//         // Extract page from variables in the result
//         const variables = data.variables || {};
//         const page = variables.page;
//         const size = variables.size;
        
//         if (typeof page === 'number' && typeof size === 'number') {
//           const pageKey = `${page}-${size}`;
          
//           // Store in cache with timestamp
//           const now = new Date().getTime();
//           pagesCache.current.set(pageKey, {
//             data: data.getPaginatedTasks.tasks,
//             timestamp: now,
//             fresh: true
//           });
          
//           // Remove from fetching set
//           fetchingPages.current.delete(pageKey);
//         }
//       }
//     },
//     onError: (error) => {
//       console.error("Error fetching page:", error);
//       const variables = error?.networkError?.result?.variables;
//       if (variables) {
//         const pageKey = `${variables.page}-${variables.size}`;
//         fetchingPages.current.delete(pageKey);
//       } else {
//         // If we can't extract variables, clear all fetching flags as a fallback
//         fetchingPages.current.clear();
//       }
//     }
//   });

//   // Pre-fetch adjacent pages
//   useEffect(() => {
//     // Don't prefetch during searches or loading
//     if (debouncedSearchText || loading) return;
    
//     // Calculate which pages to prefetch (next and previous)
//     const pagesToFetch = [];
    
//     // Next page - prefetch up to 2 pages ahead
//     if (paginationModel.page + 1 < Math.ceil(totalCount / paginationModel.pageSize)) {
//       pagesToFetch.push(paginationModel.page + 1);
      
//       // Add second page ahead too if it exists
//       if (paginationModel.page + 2 < Math.ceil(totalCount / paginationModel.pageSize)) {
//         pagesToFetch.push(paginationModel.page + 2);
//       }
//     }
    
//     // Previous page
//     if (paginationModel.page > 0) {
//       pagesToFetch.push(paginationModel.page - 1);
//     }
    
//     // Fetch each page that's not already in recent cache or being fetched
//     pagesToFetch.forEach(page => {
//       const pageKey = `${page}-${paginationModel.pageSize}`;
//       const cacheEntry = pagesCache.current.get(pageKey);
//       const now = new Date().getTime();
      
//       // Only fetch if:
//       // 1. Not in cache, OR
//       // 2. Cache is expired, AND
//       // 3. Not currently being fetched
//       if (
//         (!cacheEntry || 
//         (now - cacheEntry.timestamp > CACHE_EXPIRATION_MS)) && 
//         !fetchingPages.current.has(pageKey)
//       ) {
//         // Mark as being fetched to prevent duplicate requests
//         fetchingPages.current.add(pageKey);
        
//         fetchPage({ 
//           variables: { 
//             page, 
//             size: paginationModel.pageSize 
//           } 
//         });
//       }
//     });
//   }, [paginationModel, loading, totalCount, debouncedSearchText, fetchPage]);

//   // Limit the size of the cache 
//   useEffect(() => {
//     if (pagesCache.current.size > MAX_CACHE_SIZE) {
//       // Keep only the current and adjacent pages, prioritizing recent access
//       const keys = Array.from(pagesCache.current.keys()).map(key => {
//         const [page] = key.split('-').map(Number);
//         const entry = pagesCache.current.get(key);
//         return { 
//           key, 
//           page, 
//           distance: Math.abs(page - paginationModel.page),
//           timestamp: entry.timestamp
//         };
//       });
      
//       // Sort keys: first by distance (ascending), then by timestamp (descending)
//       keys.sort((a, b) => {
//         if (a.distance !== b.distance) {
//           return a.distance - b.distance;
//         }
//         // If distance is the same, older entries first (ascending timestamp)
//         return a.timestamp - b.timestamp;
//       });
      
//       // Remove oldest/furthest entries to keep cache size at MAX_CACHE_SIZE
//       const keysToKeep = keys.slice(0, MAX_CACHE_SIZE);
      
//       // Create new Map with only keys to keep
//       const newCache = new Map();
//       keysToKeep.forEach(k => {
//         newCache.set(k.key, pagesCache.current.get(k.key));
//       });
      
//       pagesCache.current = newCache;
//     }
//   }, [paginationModel.page]);

//   // Mark cache entries as stale after 1 minute
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const now = new Date().getTime();
      
//       // Mark entries as stale if they're older than CACHE_EXPIRATION_MS
//       pagesCache.current.forEach((entry, key) => {
//         if (now - entry.timestamp > CACHE_EXPIRATION_MS) {
//           entry.fresh = false;
//           pagesCache.current.set(key, entry);
//         }
//       });
//     }, 10000); // Check every 10 seconds
    
//     return () => clearInterval(interval);
//   }, []);

//   // Set up 1-minute polling interval for auto-refresh of current page
//   useEffect(() => {
//     const interval = setInterval(() => {
//       // Only refresh if not already refreshing
//       if (!isRefreshing) {
//         setIsRefreshing(true);
        
//         // Refresh current page only, not all cache
//         refetch().catch(err => {
//           console.error("Auto-refresh error:", err);
//           setIsRefreshing(false);
//         });
//       }
//     }, CACHE_EXPIRATION_MS); // 60 seconds = 1 minute
    
//     return () => clearInterval(interval);
//   }, [refetch, isRefreshing]);

//   // Format dates consistently - FIXED to handle null/undefined properly
//   const formatDate = useCallback((isoString) => {
//     if (!isoString) return "N/A";
    
//     try {
//       const date = new Date(isoString);
//       return isNaN(date.getTime()) 
//         ? "Invalid Date" 
//         : date.toLocaleDateString("en-GB", {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric'
//           });
//     } catch (e) {
//       return "N/A";
//     }
//   }, []);

//   // Set up debounced search
//   const debouncedSetSearch = useCallback(
//     debounce((value) => {
//       setDebouncedSearchText(value);
//       // Reset to first page when searching
//       setPaginationModel(prev => ({ ...prev, page: 0 }));
//     }, 300),
//     []
//   );

//   const handleSearchChange = useCallback(
//     (e) => {
//       setSearchText(e.target.value);
//       debouncedSetSearch(e.target.value);
//     },
//     [debouncedSetSearch]
//   );

//   // Manual refresh button handler
//   const handleManualRefresh = useCallback(() => {
//     if (isRefreshing) return; // Prevent multiple refreshes
    
//     setIsRefreshing(true);
//     // Clear cache on manual refresh to ensure fresh data
//     pagesCache.current.clear();
//     fetchingPages.current.clear();
//     refetch().catch(err => {
//       console.error("Manual refresh error:", err);
//       setIsRefreshing(false);
//     });
//   }, [refetch, isRefreshing]);

//   // Check if data is fresh or from cache
//   const getCurrentPageCacheStatus = useCallback(() => {
//     const pageKey = `${paginationModel.page}-${paginationModel.pageSize}`;
//     const cacheEntry = pagesCache.current.get(pageKey);
    
//     if (!cacheEntry) return { isCached: false, fresh: true };
    
//     return { 
//       isCached: true, 
//       fresh: cacheEntry.fresh,
//       timestamp: cacheEntry.timestamp
//     };
//   }, [paginationModel]);

//   // Filter tasks if needed (client-side filtering)
//   const displayedTasks = useMemo(() => {
//     let tasksToShow = [];
    
//     // First check if we have this page in cache
//     const pageKey = `${paginationModel.page}-${paginationModel.pageSize}`;
//     const cacheEntry = pagesCache.current.get(pageKey);
    
//     if (cacheEntry) {
//       tasksToShow = cacheEntry.data;
//     } else if (data?.getPaginatedTasks?.tasks) {
//       tasksToShow = data.getPaginatedTasks.tasks;
      
//       // If we got data from server but it's not in cache, add it
//       const now = new Date().getTime();
//       pagesCache.current.set(pageKey, {
//         data: tasksToShow,
//         timestamp: now,
//         fresh: true
//       });
//     }
    
//     // If we're doing client-side search filtering
//     if (debouncedSearchText && tasksToShow.length > 0) {
//       const searchLower = debouncedSearchText.toLowerCase();
//       return tasksToShow.filter(
//         (task) =>
//           (task.jid || "").toLowerCase().includes(searchLower) ||
//           (task.articleId || "").toLowerCase().includes(searchLower) ||
//           (task.taskName || "").toLowerCase().includes(searchLower) ||
//           (task.user || "").toLowerCase().includes(searchLower) ||
//           (task.department || "").toLowerCase().includes(searchLower)
//       );
//     }
    
//     return tasksToShow;
//   }, [data, paginationModel, debouncedSearchText]);

//   // Define columns - FIXED date handling
//   const columns = useMemo(() => [
//     { field: "id", headerName: "ID", width: 80 },
//     { field: "jid", headerName: "JID", width: 90 },
//     { field: "articleId", headerName: "Article ID", width: 90 },
//     { field: "taskName", headerName: "Task Name", width: 180 },
//     { field: "user", headerName: "User", width: 130 },
//     {
//       field: "dueDate",
//       headerName: "Due Date",
//       width: 130,
//       valueFormatter: (params) => formatDate(params.value),
//     },
//     {
//       field: "receivedDate",
//       headerName: "Received Date",
//       width: 130,
//       valueFormatter: (params) => formatDate(params.value),
//     },
//     { field: "journalComplexity", headerName: "Complexity", width: 120 },
//     { field: "department", headerName: "Department", width: 120 },
//     { field: "taskId", headerName: "Task ID", width: 100 },
//     { field: "customer", headerName: "Customer", width: 120 },
//   ], [formatDate]);

//   // Handle pagination changes with optimizations
//   const handlePaginationModelChange = useCallback((newModel) => {
//     setPaginationModel(newModel);
//   }, []);

//   // Show loading state for initial load
//   if (loading && !data && displayedTasks.length === 0) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // Show error state
//   if (error && !displayedTasks.length) {
//     return (
//       <Box sx={{ p: 2, color: "error.main" }}>
//         <Typography variant="h6">Error loading tasks:</Typography>
//         <Typography>{error.message}</Typography>
//         <Box sx={{ mt: 2 }}>
//           <Button 
//             startIcon={<Refresh />} 
//             onClick={handleManualRefresh} 
//             variant="contained"
//             disabled={isRefreshing}
//           >
//             Try Again
//           </Button>
//         </Box>
//       </Box>
//     );
//   }

//   // Get cache status to display proper indicators
//   const { isCached, fresh } = getCurrentPageCacheStatus();
//   const cacheKey = `${paginationModel.page}-${paginationModel.pageSize}`;
//   const cacheEntry = pagesCache.current.get(cacheKey);
//   const dataAge = cacheEntry ? Math.floor((new Date().getTime() - cacheEntry.timestamp) / 1000) : 0;

//   return (
//     <Box sx={{ padding: 2 }}>
//       {/* Top Controls */}
//       <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         {/* Search Bar */}
//         <TextField
//           variant="outlined"
//           placeholder="Search Tasks"
//           value={searchText}
//           onChange={handleSearchChange}
//           size="small"
//           sx={{ maxWidth: 300 }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search color="primary" />
//               </InputAdornment>
//             ),
//           }}
//         />
        
//         {/* Refresh Button */}
//         <Button 
//           startIcon={isRefreshing ? <RotateRight className="rotating-icon" /> : <Refresh />} 
//           variant="outlined"
//           onClick={handleManualRefresh}
//           disabled={isRefreshing}
//           size="small"
//           sx={{
//             '& .rotating-icon': {
//               animation: 'spin 1s linear infinite',
//             },
//             '@keyframes spin': {
//               '0%': { transform: 'rotate(0deg)' },
//               '100%': { transform: 'rotate(360deg)' },
//             },
//           }}
//         >
//           {isRefreshing ? "Refreshing..." : "Refresh"}
//         </Button>
//       </Box>

//       {/* Data freshness indicator and last updated timestamp */}
//       <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           {lastUpdated && (
//             <Typography variant="caption" color="text.secondary">
//               Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//             </Typography>
//           )}
          
//           {isRefreshing ? (
//             <Chip 
//               size="small" 
//               color="primary" 
//               variant="outlined" 
//               label="Refreshing..."
//               icon={<RotateRight className="rotating-icon" fontSize="small" />}
//               sx={{
//                 '& .rotating-icon': {
//                   animation: 'spin 1s linear infinite',
//                 },
//                 '@keyframes spin': {
//                   '0%': { transform: 'rotate(0deg)' },
//                   '100%': { transform: 'rotate(360deg)' },
//                 },
//               }}
//             />
//           ) : isCached && !fresh ? (
//             <Tooltip title={`Data is ${dataAge} seconds old. Will auto-refresh in ${Math.max(0, 60 - dataAge)} seconds.`}>
//               <Chip 
//                 size="small" 
//                 color="warning" 
//                 variant="outlined" 
//                 label={`Cached (${dataAge}s old)`}
//               />
//             </Tooltip>
//           ) : (
//             <Tooltip title="This data is fresh (less than 1 minute old)">
//               <Chip 
//                 size="small" 
//                 color="success" 
//                 variant="outlined" 
//                 label="Live Data"
//               />
//             </Tooltip>
//           )}
//         </Box>
        
//         <Typography variant="caption" color="text.secondary">
//           Total: {totalCount} tasks {pagesCache.current.size > 0 && `(${pagesCache.current.size} pages cached)`}
//         </Typography>
//       </Box>

//       {/* Data Grid with Server-Side Pagination */}
//       <DataGrid
//         rows={displayedTasks}
//         columns={columns}
//         paginationModel={paginationModel}
//         onPaginationModelChange={handlePaginationModelChange}
//         pageSizeOptions={[10, 25, 50]}
//         pagination
//         paginationMode="server"
//         rowCount={totalCount}
//         loading={loading && displayedTasks.length === 0}
//         checkboxSelection
//         disableRowSelectionOnClick
//         autoHeight
//         keepNonExistentRowsSelected
//         getRowId={(row) => row.id}
//         sx={{
//           "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
//           "& .MuiDataGrid-cell": { borderBottom: "1px solid #e0e0e0" },
//           "& .MuiDataGrid-root": { border: "1px solid #e0e0e0", borderRadius: "8px" },
//         }}
//         slotProps={{
//           pagination: {
//             labelRowsPerPage: 'Per page:',
//           },
//         }}
//       />
//     </Box>
//   );
// };

// export default TaskList;





// import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
// import { useQuery, useLazyQuery, gql } from "@apollo/client";
// import { DataGrid } from "@mui/x-data-grid";
// import { TextField, Box, InputAdornment, CircularProgress, Typography, Chip, Button, Tooltip } from "@mui/material";
// import { Search, Refresh, RotateRight, New } from "@mui/icons-material";
// import debounce from "lodash/debounce";

// // Use the correct unified paginated query
// const GET_PAGINATED_TASKS = gql`
//   query GetPaginatedTasks($page: Int!, $size: Int!) {
//     getPaginatedTasks(page: $page, size: $size) {
//       tasks {
//         id
//         jid
//         articleId
//         taskName
//         user
//         dueDate
//         receivedDate
//         journalComplexity
//         department
//         taskId
//         customer
//       }
//       totalCount
//     }
//   }
// `;

// const TaskList = () => {
//   // Pagination state
//   const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
//   const [searchText, setSearchText] = useState("");
//   const [debouncedSearchText, setDebouncedSearchText] = useState("");
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [totalCount, setTotalCount] = useState(0);
  
//   // Cache for pagination data - store pages with timestamps
//   const pagesCache = useRef(new Map());
//   // Track what pages are being fetched
//   const fetchingPages = useRef(new Set());
//   // Cache entry expiration time (1 minute)
//   const CACHE_EXPIRATION_MS = 60000;
//   // Reduced cache size for more real-time data
//   const MAX_CACHE_SIZE = 5;
  
//   // Main query for current page
//   const { loading, error, data, refetch } = useQuery(GET_PAGINATED_TASKS, {
//     variables: { 
//       page: paginationModel.page, 
//       size: paginationModel.pageSize 
//     },
//     fetchPolicy: "network-only", // Force network on refresh
//     notifyOnNetworkStatusChange: true,
//     onCompleted: (data) => {
//       const now = new Date();
//       setLastUpdated(now);
//       setIsRefreshing(false);
      
//       if (data?.getPaginatedTasks) {
//         // Update total count
//         setTotalCount(data.getPaginatedTasks.totalCount);
        
//         // Cache this page with timestamp
//         const pageKey = `${paginationModel.page}-${paginationModel.pageSize}`;
//         pagesCache.current.set(pageKey, {
//           data: data.getPaginatedTasks.tasks,
//           timestamp: now.getTime(),
//           fresh: true
//         });
        
//         // Remove from fetching set
//         fetchingPages.current.delete(pageKey);
//       }
//     }
//   });

//   // Generic function to fetch any page
//   const [fetchPage] = useLazyQuery(GET_PAGINATED_TASKS, {
//     fetchPolicy: "network-only",
//     onCompleted: (data) => {
//       if (data?.getPaginatedTasks?.tasks) {
//         // Extract page from variables
//         const { page, size } = data.variables || {};
//         if (typeof page === 'number' && typeof size === 'number') {
//           const pageKey = `${page}-${size}`;
          
//           // Store in cache with timestamp
//           const now = new Date().getTime();
//           pagesCache.current.set(pageKey, {
//             data: data.getPaginatedTasks.tasks,
//             timestamp: now,
//             fresh: true
//           });
          
//           // Remove from fetching set
//           fetchingPages.current.delete(pageKey);
//         }
//       }
//     },
//     onError: (error) => {
//       console.error("Error fetching page:", error);
//       // Remove from fetching set on error
//       const variables = error.networkError?.result?.variables;
//       if (variables) {
//         const pageKey = `${variables.page}-${variables.size}`;
//         fetchingPages.current.delete(pageKey);
//       }
//     }
//   });

//   // Pre-fetch adjacent pages
//   useEffect(() => {
//     // Don't prefetch during searches or loading
//     if (debouncedSearchText || loading) return;
    
//     // Calculate which pages to prefetch (next and previous)
//     const pagesToFetch = [];
    
//     // Next page
//     if ((paginationModel.page + 1) * paginationModel.pageSize < totalCount) {
//       pagesToFetch.push(paginationModel.page + 1);
//     }
    
//     // Previous page
//     if (paginationModel.page > 0) {
//       pagesToFetch.push(paginationModel.page - 1);
//     }
    
//     // Fetch each page that's not already in recent cache or being fetched
//     pagesToFetch.forEach(page => {
//       const pageKey = `${page}-${paginationModel.pageSize}`;
//       const cacheEntry = pagesCache.current.get(pageKey);
//       const now = new Date().getTime();
      
//       // Only fetch if:
//       // 1. Not in cache, OR
//       // 2. Cache is expired, AND
//       // 3. Not currently being fetched
//       if (
//         !cacheEntry || 
//         (now - cacheEntry.timestamp > CACHE_EXPIRATION_MS) && 
//         !fetchingPages.current.has(pageKey)
//       ) {
//         // Mark as being fetched to prevent duplicate requests
//         fetchingPages.current.add(pageKey);
        
//         fetchPage({ 
//           variables: { 
//             page, 
//             size: paginationModel.pageSize 
//           } 
//         });
//       }
//     });
//   }, [paginationModel, loading, totalCount, debouncedSearchText, fetchPage]);

//   // Limit the size of the cache 
//   useEffect(() => {
//     if (pagesCache.current.size > MAX_CACHE_SIZE) {
//       // Keep only the current and adjacent pages, prioritizing recent access
//       const keys = Array.from(pagesCache.current.keys()).map(key => {
//         const [page] = key.split('-').map(Number);
//         const entry = pagesCache.current.get(key);
//         return { 
//           key, 
//           page, 
//           distance: Math.abs(page - paginationModel.page),
//           timestamp: entry.timestamp
//         };
//       });
      
//       // Sort keys: first by distance (ascending), then by timestamp (ascending)
//       keys.sort((a, b) => {
//         if (a.distance !== b.distance) {
//           return a.distance - b.distance;
//         }
//         // If distance is the same, older entries first
//         return a.timestamp - b.timestamp;
//       });
      
//       // Remove oldest/furthest entries to keep cache size at MAX_CACHE_SIZE
//       const keysToKeep = keys.slice(0, MAX_CACHE_SIZE);
//       const keysToRemove = keys.slice(MAX_CACHE_SIZE);
      
//       // Clear those entries
//       pagesCache.current = new Map(
//         keysToKeep.map(k => [k.key, pagesCache.current.get(k.key)])
//       );
//     }
//   }, [paginationModel.page]);

//   // Mark cache entries as stale after 1 minute
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const now = new Date().getTime();
      
//       // Mark entries as stale if they're older than CACHE_EXPIRATION_MS
//       pagesCache.current.forEach((entry, key) => {
//         if (now - entry.timestamp > CACHE_EXPIRATION_MS) {
//           entry.fresh = false;
//           pagesCache.current.set(key, entry);
//         }
//       });
//     }, 10000); // Check every 10 seconds
    
//     return () => clearInterval(interval);
//   }, []);

//   // Set up 1-minute polling interval for auto-refresh of current page
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsRefreshing(true);
      
//       // Clear all cache entries on scheduled refresh
//       pagesCache.current.clear();
//       fetchingPages.current.clear();
      
//       refetch().catch(err => {
//         console.error("Auto-refresh error:", err);
//         setIsRefreshing(false);
//       });
//     }, CACHE_EXPIRATION_MS); // 60 seconds = 1 minute
    
//     return () => clearInterval(interval);
//   }, [refetch]);

//   // Format dates consistently
//   const formatDate = useCallback((isoString) => {
//     if (!isoString) return "N/A";
//     const date = new Date(isoString);
//     return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-GB");
//   }, []);

//   // Set up debounced search
//   const debouncedSetSearch = useCallback(
//     debounce((value) => {
//       setDebouncedSearchText(value);
//       // Reset to first page when searching
//       setPaginationModel(prev => ({ ...prev, page: 0 }));
//     }, 300),
//     []
//   );

//   const handleSearchChange = useCallback(
//     (e) => {
//       setSearchText(e.target.value);
//       debouncedSetSearch(e.target.value);
//     },
//     [debouncedSetSearch]
//   );

//   // Manual refresh button handler
//   const handleManualRefresh = useCallback(() => {
//     setIsRefreshing(true);
//     // Clear cache on manual refresh to ensure fresh data
//     pagesCache.current.clear();
//     fetchingPages.current.clear();
//     refetch().catch(err => {
//       console.error("Manual refresh error:", err);
//       setIsRefreshing(false);
//     });
//   }, [refetch]);

//   // Check if data is fresh or from cache
//   const getCurrentPageCacheStatus = useCallback(() => {
//     const pageKey = `${paginationModel.page}-${paginationModel.pageSize}`;
//     const cacheEntry = pagesCache.current.get(pageKey);
    
//     if (!cacheEntry) return { isCached: false, fresh: true };
    
//     return { 
//       isCached: true, 
//       fresh: cacheEntry.fresh,
//       timestamp: cacheEntry.timestamp
//     };
//   }, [paginationModel]);

//   // Filter tasks if needed (client-side filtering)
//   const displayedTasks = useMemo(() => {
//     let tasksToShow = [];
    
//     // First check if we have this page in cache
//     const pageKey = `${paginationModel.page}-${paginationModel.pageSize}`;
//     const cacheEntry = pagesCache.current.get(pageKey);
    
//     if (cacheEntry) {
//       tasksToShow = cacheEntry.data;
//     } else if (data?.getPaginatedTasks?.tasks) {
//       tasksToShow = data.getPaginatedTasks.tasks;
      
//       // If we got data from server but it's not in cache, add it
//       const now = new Date().getTime();
//       pagesCache.current.set(pageKey, {
//         data: tasksToShow,
//         timestamp: now,
//         fresh: true
//       });
//     }
    
//     // If we're doing client-side search filtering
//     if (debouncedSearchText && tasksToShow.length > 0) {
//       const searchLower = debouncedSearchText.toLowerCase();
//       return tasksToShow.filter(
//         (task) =>
//           task.jid?.toLowerCase().includes(searchLower) ||
//           task.articleId?.toLowerCase().includes(searchLower) ||
//           task.taskName?.toLowerCase().includes(searchLower) ||
//           task.user?.toLowerCase().includes(searchLower) ||
//           task.department?.toLowerCase().includes(searchLower)
//       );
//     }
    
//     return tasksToShow;
//   }, [data, paginationModel, debouncedSearchText]);

//   // Define columns
//   const columns = useMemo(() => [
//     { field: "id", headerName: "ID", width: 80 },
//     { field: "jid", headerName: "JID", width: 90 },
//     { field: "articleId", headerName: "Article ID", width: 90 },
//     { field: "taskName", headerName: "Task Name", width: 180 },
//     { field: "user", headerName: "User", width: 130 },
//     {
//       field: "dueDate",
//       headerName: "Due Date",
//       width: 130,
//       valueGetter: (params) => params.value, // Store original value
//       renderCell: (params) => formatDate(params.value),
//     },
//     {
//       field: "receivedDate",
//       headerName: "Received Date",
//       width: 130,
//       valueGetter: (params) => params.value, // Store original value
//       renderCell: (params) => formatDate(params.value),
//     },
//     { field: "journalComplexity", headerName: "Complexity", width: 120 },
//     { field: "department", headerName: "Department", width: 120 },
//     { field: "taskId", headerName: "Task ID", width: 100 },
//     { field: "customer", headerName: "Customer", width: 120 },
//   ], [formatDate]);

//   // Handle pagination changes with optimizations
//   const handlePaginationModelChange = useCallback((newModel) => {
//     setPaginationModel(newModel);
//   }, []);

//   // Show loading state for initial load
//   if (loading && !data && displayedTasks.length === 0) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // Show error state
//   if (error && !displayedTasks.length) {
//     return (
//       <Box sx={{ p: 2, color: "error.main" }}>
//         <Typography variant="h6">Error loading tasks:</Typography>
//         <Typography>{error.message}</Typography>
//         <Box sx={{ mt: 2 }}>
//           <Button 
//             startIcon={<Refresh />} 
//             onClick={handleManualRefresh} 
//             variant="contained"
//             disabled={isRefreshing}
//           >
//             Try Again
//           </Button>
//         </Box>
//       </Box>
//     );
//   }

//   // Get cache status to display proper indicators
//   const { isCached, fresh } = getCurrentPageCacheStatus();
//   const dataAge = isCached ? Math.floor((new Date().getTime() - pagesCache.current.get(`${paginationModel.page}-${paginationModel.pageSize}`).timestamp) / 1000) : 0;

//   return (
//     <Box sx={{ padding: 2 }}>
//       {/* Top Controls */}
//       <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         {/* Search Bar */}
//         <TextField
//           variant="outlined"
//           placeholder="Search Tasks"
//           value={searchText}
//           onChange={handleSearchChange}
//           size="small"
//           sx={{ maxWidth: 300 }}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search color="primary" />
//               </InputAdornment>
//             ),
//           }}
//         />
        
//         {/* Refresh Button */}
//         <Button 
//           startIcon={isRefreshing ? <RotateRight className="rotating-icon" /> : <Refresh />} 
//           variant="outlined"
//           onClick={handleManualRefresh}
//           disabled={isRefreshing}
//           size="small"
//           sx={{
//             '& .rotating-icon': {
//               animation: 'spin 1s linear infinite',
//             },
//             '@keyframes spin': {
//               '0%': { transform: 'rotate(0deg)' },
//               '100%': { transform: 'rotate(360deg)' },
//             },
//           }}
//         >
//           {isRefreshing ? "Refreshing..." : "Refresh"}
//         </Button>
//       </Box>

//       {/* Data freshness indicator and last updated timestamp */}
//       <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           {lastUpdated && (
//             <Typography variant="caption" color="text.secondary">
//               Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//             </Typography>
//           )}
          
//           {isRefreshing ? (
//             <Chip 
//               size="small" 
//               color="primary" 
//               variant="outlined" 
//               label="Refreshing..."
//               icon={<RotateRight className="rotating-icon" fontSize="small" />}
//               sx={{
//                 '& .rotating-icon': {
//                   animation: 'spin 1s linear infinite',
//                 },
//                 '@keyframes spin': {
//                   '0%': { transform: 'rotate(0deg)' },
//                   '100%': { transform: 'rotate(360deg)' },
//                 },
//               }}
//             />
//           ) : isCached && !fresh ? (
//             <Tooltip title={`Data is ${dataAge} seconds old. Will auto-refresh in ${Math.max(0, 60 - dataAge)} seconds.`}>
//               <Chip 
//                 size="small" 
//                 color="warning" 
//                 variant="outlined" 
//                 label={`Cached (${dataAge}s old)`}
//               />
//             </Tooltip>
//           ) : (
//             <Tooltip title="This data is fresh (less than 1 minute old)">
//               <Chip 
//                 size="small" 
//                 color="success" 
//                 variant="outlined" 
//                 label="Live Data"
//               />
//             </Tooltip>
//           )}
//         </Box>
        
//         <Typography variant="caption" color="text.secondary">
//           Total: {totalCount} tasks {pagesCache.current.size > 0 && `(${pagesCache.current.size} pages cached)`}
//         </Typography>
//       </Box>

//       {/* Data Grid with Server-Side Pagination */}
//       <DataGrid
//         rows={displayedTasks}
//         columns={columns}
//         paginationModel={paginationModel}
//         onPaginationModelChange={handlePaginationModelChange}
//         pageSizeOptions={[10, 25, 50]}
//         pagination
//         paginationMode="server"
//         rowCount={totalCount}
//         loading={loading && displayedTasks.length === 0}
//         checkboxSelection
//         disableRowSelectionOnClick
//         autoHeight
//         keepNonExistentRowsSelected
//         getRowId={(row) => row.id}
//         sx={{
//           "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
//           "& .MuiDataGrid-cell": { borderBottom: "1px solid #e0e0e0" },
//           "& .MuiDataGrid-root": { border: "1px solid #e0e0e0", borderRadius: "8px" },
//         }}
//         slotProps={{
//           pagination: {
//             labelRowsPerPage: 'Per page:',
//           },
//         }}
//       />
//     </Box>
//   );
// };

// export default TaskList;


import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery, useLazyQuery, gql } from "@apollo/client";
import { DataGrid } from "@mui/x-data-grid";
import { TextField, Box, InputAdornment, CircularProgress, Typography, Chip, Button, Tooltip } from "@mui/material";
import { Search, Refresh, RotateRight } from "@mui/icons-material";
import debounce from "lodash/debounce";

// Use the correct unified paginated query
const GET_PAGINATED_TASKS = gql`
 query GetPaginatedTasks($page: Int!, $size: Int!) {
   getPaginatedTasks(page: $page, size: $size) {
     tasks {
       id
       jid
       articleId
       taskName
       user
       dueDate
       receivedDate
       journalComplexity
       department
       taskId
       customer
     }
     totalCount
   }
 }
`;

const TaskList = () => {
 // Pagination state - updated to show 25 rows by default
 const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
 const [searchText, setSearchText] = useState("");
 const [debouncedSearchText, setDebouncedSearchText] = useState("");
 const [lastUpdated, setLastUpdated] = useState(null);
 const [isRefreshing, setIsRefreshing] = useState(false);
 const [totalCount, setTotalCount] = useState(0);
 // Cache for pagination data - store pages with timestamps
 const pagesCache = useRef(new Map());
 // Track what pages are being fetched
 const fetchingPages = useRef(new Set());
 // Cache entry expiration time (1 minute)
 const CACHE_EXPIRATION_MS = 60000;
 // Reduced cache size for more real-time data
 const MAX_CACHE_SIZE = 5;
 
 // Main query for current page
 const { loading, error, data, refetch } = useQuery(GET_PAGINATED_TASKS, {
   variables: {
     page: paginationModel.page,
     size: paginationModel.pageSize
   },
   fetchPolicy: "network-only", // Force network on refresh
   notifyOnNetworkStatusChange: true,
   onCompleted: (data) => {
     const now = new Date();
     setLastUpdated(now);
     setIsRefreshing(false);
    
     if (data?.getPaginatedTasks) {
       // Update total count
       setTotalCount(data.getPaginatedTasks.totalCount);
      
       // Cache this page with timestamp
       const pageKey = `${paginationModel.page}-${paginationModel.pageSize}`;
       pagesCache.current.set(pageKey, {
         data: data.getPaginatedTasks.tasks,
         timestamp: now.getTime(),
         fresh: true
       });
      
       // Remove from fetching set
       fetchingPages.current.delete(pageKey);
     }
   }
 });

 // Generic function to fetch any page
 const [fetchPage] = useLazyQuery(GET_PAGINATED_TASKS, {
   fetchPolicy: "network-only",
   onCompleted: (data) => {
     if (data?.getPaginatedTasks?.tasks) {
       // Extract page from variables
       const { page, size } = data.variables || {};
       if (typeof page === 'number' && typeof size === 'number') {
         const pageKey = `${page}-${size}`;
        
         // Store in cache with timestamp
         const now = new Date().getTime();
         pagesCache.current.set(pageKey, {
           data: data.getPaginatedTasks.tasks,
           timestamp: now,
           fresh: true
         });
        
         // Remove from fetching set
         fetchingPages.current.delete(pageKey);
       }
     }
   },
   onError: (error) => {
     console.error("Error fetching page:", error);
     // Remove from fetching set on error
     const variables = error.networkError?.result?.variables;
     if (variables) {
       const pageKey = `${variables.page}-${variables.size}`;
       fetchingPages.current.delete(pageKey);
     }
   }
 });

 // Pre-fetch adjacent pages
 useEffect(() => {
   // Don't prefetch during searches or loading
   if (debouncedSearchText || loading) return;
  
   // Calculate which pages to prefetch (next and previous)
   const pagesToFetch = [];
  
   // Next page
   if ((paginationModel.page + 1) * paginationModel.pageSize < totalCount) {
     pagesToFetch.push(paginationModel.page + 1);
   }
  
   // Previous page
   if (paginationModel.page > 0) {
     pagesToFetch.push(paginationModel.page - 1);
   }
  
   // Fetch each page that's not already in recent cache or being fetched
   pagesToFetch.forEach(page => {
     const pageKey = `${page}-${paginationModel.pageSize}`;
     const cacheEntry = pagesCache.current.get(pageKey);
     const now = new Date().getTime();
    
     // Only fetch if:
     // 1. Not in cache, OR
     // 2. Cache is expired, AND
     // 3. Not currently being fetched
     if (
       !cacheEntry ||
       (now - cacheEntry.timestamp > CACHE_EXPIRATION_MS) &&
       !fetchingPages.current.has(pageKey)
     ) {
       // Mark as being fetched to prevent duplicate requests
       fetchingPages.current.add(pageKey);
      
       fetchPage({
         variables: {
           page,
           size: paginationModel.pageSize
         }
       });
     }
   });
 }, [paginationModel, loading, totalCount, debouncedSearchText, fetchPage]);

 // Limit the size of the cache
 useEffect(() => {
   if (pagesCache.current.size > MAX_CACHE_SIZE) {
     // Keep only the current and adjacent pages, prioritizing recent access
     const keys = Array.from(pagesCache.current.keys()).map(key => {
       const [page] = key.split('-').map(Number);
       const entry = pagesCache.current.get(key);
       return {
         key,
         page,
         distance: Math.abs(page - paginationModel.page),
         timestamp: entry.timestamp
       };
     });
    
     // Sort keys: first by distance (ascending), then by timestamp (ascending)
     keys.sort((a, b) => {
       if (a.distance !== b.distance) {
         return a.distance - b.distance;
       }
       // If distance is the same, older entries first
       return a.timestamp - b.timestamp;
     });
    
     // Remove oldest/furthest entries to keep cache size at MAX_CACHE_SIZE
     const keysToKeep = keys.slice(0, MAX_CACHE_SIZE);
     const keysToRemove = keys.slice(MAX_CACHE_SIZE);
    
     // Clear those entries
     pagesCache.current = new Map(
       keysToKeep.map(k => [k.key, pagesCache.current.get(k.key)])
     );
   }
 }, [paginationModel.page]);

 // Mark cache entries as stale after 1 minute
 useEffect(() => {
   const interval = setInterval(() => {
     const now = new Date().getTime();
    
     // Mark entries as stale if they're older than CACHE_EXPIRATION_MS
     pagesCache.current.forEach((entry, key) => {
       if (now - entry.timestamp > CACHE_EXPIRATION_MS) {
         entry.fresh = false;
         pagesCache.current.set(key, entry);
       }
     });
   }, 10000); // Check every 10 seconds
  
   return () => clearInterval(interval);
 }, []);

 // Set up 1-minute polling interval for auto-refresh of current page
 useEffect(() => {
   const interval = setInterval(() => {
     setIsRefreshing(true);
    
     // Clear all cache entries on scheduled refresh
     pagesCache.current.clear();
     fetchingPages.current.clear();
    
     refetch().catch(err => {
       console.error("Auto-refresh error:", err);
       setIsRefreshing(false);
     });
   }, CACHE_EXPIRATION_MS); // 60 seconds = 1 minute
  
   return () => clearInterval(interval);
 }, [refetch]);

 // Improved date formatting function to handle different date formats
//  const formatDate = useCallback((isoString) => {
//    if (!isoString) return "N/A";
   
//    try {
//      // Try to parse the date - handle both ISO strings and other formats
//      const date = new Date(isoString);
     
//      // Check if the date is valid
//      if (isNaN(date.getTime())) {
//        return "Invalid Date";
//      }
     
//      // Format as DD/MM/YYYY
//      return date.toLocaleDateString("en-GB", {
//        day: '2-digit',
//        month: '2-digit',
//        year: 'numeric'
//      });
//    } catch (error) {
//      console.error("Date formatting error:", error, isoString);
//      return "Format Error";
//    }
//  }, []);

const formatDate = useCallback((dateString) => {
  if (!dateString || typeof dateString !== "string" || dateString.trim() === "") return "N/A";

  // Convert "YYYY-MM-DD HH:mm:ss" to "YYYY-MM-DDTHH:mm:ss"
  const isoString = dateString.replace(" ", "T");
  const date = new Date(isoString);

  return isNaN(date.getTime())
    ? "Invalid Date"
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
}, []);

 // Set up debounced search
 const debouncedSetSearch = useCallback(
   debounce((value) => {
     setDebouncedSearchText(value);
     // Reset to first page when searching
     setPaginationModel(prev => ({ ...prev, page: 0 }));
   }, 300),
   []
 );

 const handleSearchChange = useCallback(
   (e) => {
     setSearchText(e.target.value);
     debouncedSetSearch(e.target.value);
   },
   [debouncedSetSearch]
 );

 // Manual refresh button handler
 const handleManualRefresh = useCallback(() => {
   setIsRefreshing(true);
   // Clear cache on manual refresh to ensure fresh data
   pagesCache.current.clear();
   fetchingPages.current.clear();
   refetch().catch(err => {
     console.error("Manual refresh error:", err);
     setIsRefreshing(false);
   });
 }, [refetch]);

 // Check if data is fresh or from cache
 const getCurrentPageCacheStatus = useCallback(() => {
   const pageKey = `${paginationModel.page}-${paginationModel.pageSize}`;
   const cacheEntry = pagesCache.current.get(pageKey);
  
   if (!cacheEntry) return { isCached: false, fresh: true };
  
   return {
     isCached: true,
     fresh: cacheEntry.fresh,
     timestamp: cacheEntry.timestamp
   };
 }, [paginationModel]);

 // Filter tasks if needed (client-side filtering)
 const displayedTasks = useMemo(() => {
   let tasksToShow = [];
  
   // First check if we have this page in cache
   const pageKey = `${paginationModel.page}-${paginationModel.pageSize}`;
   const cacheEntry = pagesCache.current.get(pageKey);
  
   if (cacheEntry) {
     tasksToShow = cacheEntry.data;
   } else if (data?.getPaginatedTasks?.tasks) {
     tasksToShow = data.getPaginatedTasks.tasks;
    
     // If we got data from server but it's not in cache, add it
     const now = new Date().getTime();
     pagesCache.current.set(pageKey, {
       data: tasksToShow,
       timestamp: now,
       fresh: true
     });
   }
  
   // If we're doing client-side search filtering
   if (debouncedSearchText && tasksToShow.length > 0) {
     const searchLower = debouncedSearchText.toLowerCase();
     return tasksToShow.filter(
       (task) =>
         task.jid?.toLowerCase().includes(searchLower) ||
         task.articleId?.toLowerCase().includes(searchLower) ||
         task.taskName?.toLowerCase().includes(searchLower) ||
         task.user?.toLowerCase().includes(searchLower) ||
         task.department?.toLowerCase().includes(searchLower)
     );
   }
  
   return tasksToShow;
 }, [data, paginationModel, debouncedSearchText]);

 // Define columns with improved styling
 const columns = useMemo(() => [
   { field: "id", headerName: "ID", width: 70 },
   { field: "jid", headerName: "JID", width: 80 },
   { field: "articleId", headerName: "Article ID", width: 85 },
   { field: "taskName", headerName: "Task Name", width: 160 },
   { field: "user", headerName: "User", width: 115 },
   {
    field: "dueDate",
    headerName: "Due Date",
    width: 110,
    renderCell: (params) => formatDate(params.row.dueDate),
  },
  {
    field: "receivedDate",
    headerName: "Received Date",
    width: 110,
    renderCell: (params) => formatDate(params.row.receivedDate),
  },
  
   { field: "journalComplexity", headerName: "Complexity", width: 100 },
   { field: "department", headerName: "Department", width: 110 },
   { field: "taskId", headerName: "Task ID", width: 90 },
   { field: "customer", headerName: "Customer", width: 110 },
 ], [formatDate]);

 // Handle pagination changes with optimizations
 const handlePaginationModelChange = useCallback((newModel) => {
   setPaginationModel(newModel);
 }, []);

 // Show loading state for initial load
 if (loading && !data && displayedTasks.length === 0) {
   return (
     <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
       <CircularProgress />
     </Box>
   );
 }

 // Show error state
 if (error && !displayedTasks.length) {
   return (
     <Box sx={{ p: 2, color: "error.main" }}>
       <Typography variant="h6">Error loading tasks:</Typography>
       <Typography>{error.message}</Typography>
       <Box sx={{ mt: 2 }}>
         <Button
           startIcon={<Refresh />}
           onClick={handleManualRefresh}
           variant="contained"
           disabled={isRefreshing}
         >
           Try Again
         </Button>
       </Box>
     </Box>
   );
 }

 // Get cache status to display proper indicators
 const { isCached, fresh } = getCurrentPageCacheStatus();
 const dataAge = isCached ? Math.floor((new Date().getTime() - pagesCache.current.get(`${paginationModel.page}-${paginationModel.pageSize}`).timestamp) / 1000) : 0;

 return (
   <Box sx={{ padding: 2 }}>
     {/* Top Controls */}
     <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
       {/* Search Bar */}
       <TextField
         variant="outlined"
         placeholder="Search Tasks"
         value={searchText}
         onChange={handleSearchChange}
         size="small"
         sx={{ maxWidth: 300 }}
         InputProps={{
           startAdornment: (
             <InputAdornment position="start">
               <Search color="primary" />
             </InputAdornment>
           ),
         }}
       />
      
       {/* Refresh Button */}
       <Button
         startIcon={isRefreshing ? <RotateRight className="rotating-icon" /> : <Refresh />}
         variant="outlined"
         onClick={handleManualRefresh}
         disabled={isRefreshing}
         size="small"
         sx={{
           '& .rotating-icon': {
             animation: 'spin 1s linear infinite',
           },
           '@keyframes spin': {
             '0%': { transform: 'rotate(0deg)' },
             '100%': { transform: 'rotate(360deg)' },
           },
         }}
       >
         {isRefreshing ? "Refreshing..." : "Refresh"}
       </Button>
     </Box>

     {/* Data freshness indicator and last updated timestamp */}
     <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
       <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
         {lastUpdated && (
           <Typography variant="caption" color="text.secondary">
             Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </Typography>
         )}
        
         {isRefreshing ? (
           <Chip
             size="small"
             color="primary"
             variant="outlined"
             label="Refreshing..."
             icon={<RotateRight className="rotating-icon" fontSize="small" />}
             sx={{
               '& .rotating-icon': {
                 animation: 'spin 1s linear infinite',
               },
               '@keyframes spin': {
                 '0%': { transform: 'rotate(0deg)' },
                 '100%': { transform: 'rotate(360deg)' },
               },
             }}
           />
         ) : isCached && !fresh ? (
           <Tooltip title={`Data is ${dataAge} seconds old. Will auto-refresh in ${Math.max(0, 60 - dataAge)} seconds.`}>
             <Chip
               size="small"
               color="warning"
               variant="outlined"
               label={`Cached (${dataAge}s old)`}
             />
           </Tooltip>
         ) : (
           <Tooltip title="This data is fresh (less than 1 minute old)">
             <Chip
               size="small"
               color="success"
               variant="outlined"
               label="Live Data"
             />
           </Tooltip>
         )}
       </Box>
      
       <Typography variant="caption" color="text.secondary">
         Total: {totalCount} tasks {pagesCache.current.size > 0 && `(${pagesCache.current.size} pages cached)`}
       </Typography>
     </Box>

     {/* Data Grid with Server-Side Pagination - Updated styling */}
     <DataGrid
       rows={displayedTasks}
       columns={columns}
       paginationModel={paginationModel}
       onPaginationModelChange={handlePaginationModelChange}
       pageSizeOptions={[25, 50, 100]}
       pagination
       paginationMode="server"
       rowCount={totalCount}
       loading={loading && displayedTasks.length === 0}
       checkboxSelection
       disableRowSelectionOnClick
       keepNonExistentRowsSelected
       getRowId={(row) => row.id}
       sx={{
         // Custom font family
         fontFamily: "Tahoma, Arial, Verdana, sans-serif",
         fontSize: "0.875rem", // Smaller font size
         "& .MuiDataGrid-columnHeaders": { 
          //  backgroundColor: "#f5f5f5",
          backgroundColor: "#666",
          //  color: "#666", // Grey color for header text
           fontWeight: "bold",
         },
         "& .MuiDataGrid-columnHeaderTitle": {
           fontSize: "0.875rem", // Smaller header font
           fontWeight: 600,
         },
         "& .MuiDataGrid-cell": { 
           borderBottom: "1px solid #e0e0e0",
           fontSize: "0.8125rem", // Even smaller for data cells
           padding: "4px 8px", // Slightly reduce padding
         },
         "& .MuiDataGrid-root": { 
           border: "1px solid #e0e0e0", 
           borderRadius: "8px",
         },
         // Calculate height to fit 25 rows + header without scrolling
         "& .MuiDataGrid-main": {
           // Set height based on rows (adjust the multiplier as needed)
           // Each row height (32px) + header (56px) + pagination (52px)
           height: `calc(25 * 32px + 56px)`,
         },
         "& .MuiDataGrid-row:nth-of-type(even)": {
           backgroundColor: "#fafafa", // Alternating row colors
         },
         "& .MuiDataGrid-virtualScroller": {
           // Prevent scrollbar when showing exact number of rows
           // This makes the grid adapt to the available rows
           overflowY: "auto", 
         },
       }}
       slotProps={{
         pagination: {
           labelRowsPerPage: 'Per page:',
         },
       }}
     />
   </Box>
 );
};

export default TaskList;















// import React, { useState, useMemo, useCallback, useEffect } from "react";
// import { useQuery, gql } from "@apollo/client";
// import { DataGrid } from "@mui/x-data-grid";
// import { TextField, Box, InputAdornment, CircularProgress } from "@mui/material";
// import { Search } from "@mui/icons-material";
// import debounce from "lodash/debounce";

// const GET_TASKS = gql`
//   query GetTasks($page: Int!, $size: Int!) {
//     getTasks(page: $page, size: $size) {
//       id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer
//     }
//     getTasks2(page: $page, size: $size) {
//       id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer
//     }
//     getTasks3(page: $page, size: $size) {
//       id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer
//     }
//     getTasks4(page: $page, size: $size) {
//       id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer
//     }
//     getTasks5(page: $page, size: $size) {
//       id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer
//     }
//     getTasks6(page: $page, size: $size) {
//       id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer
//     }
//     getTasks7(page: $page, size: $size) {
//       id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer
//     }
//     getTasks8(page: $page, size: $size) {
//       id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer
//     }
//     getTasks9(page: $page, size: $size) {
//       id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer
//     }
//     getTasks10(page: $page, size: $size) {
//       id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer
//     }
//     getTotalTasksCount
//   }
// `;

// const TaskList = () => {
//   const [page, setPage] = useState(0);
//   const [pageSize, setPageSize] = useState(10);
//   const [tasks, setTasks] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [debouncedSearchText, setDebouncedSearchText] = useState("");
//   const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
//   const [lastUpdated, setLastUpdated] = useState(null);

//   const { loading, error, data, refetch } = useQuery(GET_TASKS, {
//     variables: { page, size: pageSize },
//     fetchPolicy: "cache-and-network",
//   });

//   const formatDate = useCallback((isoString) => {
//     if (!isoString) return "N/A";
//     const date = new Date(isoString);
//     return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-GB");
//   }, []);

//   const debouncedSetSearch = useCallback(
//     debounce((value) => setDebouncedSearchText(value), 300),
//     []
//   );

//   const handleSearchChange = useCallback(
//     (e) => {
//       setSearchText(e.target.value);
//       debouncedSetSearch(e.target.value);
//     },
//     [debouncedSetSearch]
//   );

//   useEffect(() => {
//     if (data) {
//       const combined = [
//         ...data.getTasks,
//         ...data.getTasks2,
//         ...data.getTasks3,
//         ...data.getTasks4,
//         ...data.getTasks5,
//         ...data.getTasks6,
//         ...data.getTasks7,
//         ...data.getTasks8,
//         ...data.getTasks9,
//         ...data.getTasks10,
//       ];

//       setTasks(combined); // Replace page-wise (not append)
//       setLastUpdated(new Date());
//     }
//   }, [data]);

//   const filteredTasks = useMemo(() => {
//     if (!tasks.length) return [];
//     if (!debouncedSearchText) return tasks;

//     const searchLower = debouncedSearchText.toLowerCase();
//     return tasks.filter(
//       (task) =>
//         task.jid?.toLowerCase().includes(searchLower) ||
//         task.articleId?.toLowerCase().includes(searchLower) ||
//         task.taskName?.toLowerCase().includes(searchLower) ||
//         task.user?.toLowerCase().includes(searchLower) ||
//         task.department?.toLowerCase().includes(searchLower)
//     );
//   }, [tasks, debouncedSearchText]);

//   const columns = useMemo(() => [
//     { field: "id", headerName: "ID", width: 80 },
//     { field: "jid", headerName: "JID", width: 90 },
//     { field: "articleId", headerName: "Article ID", width: 90 },
//     { field: "taskName", headerName: "Task Name", width: 180 },
//     { field: "user", headerName: "User", width: 130 },
//     {
//       field: "dueDate",
//       headerName: "Due Date",
//       width: 130,
//       renderCell: (params) => formatDate(params.value),
//     },
//     {
//       field: "receivedDate",
//       headerName: "Received Date",
//       width: 130,
//       renderCell: (params) => formatDate(params.value),
//     },
//     { field: "journalComplexity", headerName: "Complexity", width: 120 },
//     { field: "department", headerName: "Department", width: 120 },
//     { field: "taskId", headerName: "Task ID", flex: 1 },
//     { field: "customer", headerName: "Customer", flex: 1 },
//   ], [formatDate]);

//   const handlePaginationModelChange = (model) => {
//     setPaginationModel(model);
//     setPage(model.page);
//   };

//   if (loading && tasks.length === 0) return <p>Loading tasks...</p>;
//   if (error) return <p>Error loading tasks: {error.message}</p>;

//   return (
//     <Box sx={{ padding: 2 }}>
//       <Box sx={{ mb: 2, maxWidth: 300 }}>
//         <TextField
//           variant="outlined"
//           placeholder="Search Tasks"
//           value={searchText}
//           onChange={handleSearchChange}
//           size="small"
//           fullWidth
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search color="primary" />
//               </InputAdornment>
//             ),
//           }}
//         />
//       </Box>

//       {lastUpdated && (
//         <Box sx={{ mb: 1, fontSize: 14, color: "gray" }}>
//           Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//         </Box>
//       )}

//       <DataGrid
//         rows={filteredTasks}
//         columns={columns}
//         paginationModel={paginationModel}
//         onPaginationModelChange={handlePaginationModelChange}
//         paginationMode="server"
//         rowCount={data?.getTotalTasksCount || 0}
//         pageSizeOptions={[10]}
//         checkboxSelection
//         disableRowSelectionOnClick
//         autoHeight
//         sx={{
//           "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
//           "& .MuiDataGrid-cell": { borderBottom: "1px solid #e0e0e0" },
//           "& .MuiDataGrid-root": { border: "1px solid #e0e0e0", borderRadius: "8px" },
//         }}
//       />
//     </Box>
//   );
// };

// export default TaskList;



















// import React, { useState, useMemo, useCallback, useEffect } from "react";
// import { useQuery, gql } from "@apollo/client";
// import { DataGrid } from "@mui/x-data-grid";
// import {
//   TextField,
//   Box,
//   InputAdornment,
//   CircularProgress,
//   Typography,
// } from "@mui/material";
// import { Search } from "@mui/icons-material";
// import debounce from "lodash/debounce";

// const GET_TASKS = gql`
//   query GetTasks($page: Int!, $size: Int!) {
//     getTasks(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks2(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks3(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks4(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks5(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks6(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks7(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks8(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks9(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks10(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTotalTasksCount
//   }
// `;

// const TaskList = () => {
//   const [page, setPage] = useState(0);
//   const [pageSize] = useState(10);
//   const [tasks, setTasks] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [debouncedSearchText, setDebouncedSearchText] = useState("");
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [paginationModel, setPaginationModel] = useState({
//     page: 0,
//     pageSize: 10,
//   });

//   const { loading, error, data, fetchMore } = useQuery(GET_TASKS, {
//     variables: { page, size: pageSize },
//     fetchPolicy: "cache-and-network",
//     pollInterval: 60000, // Auto-refetch every 60 seconds
//   });

//   const formatDate = useCallback((isoString) => {
//     if (!isoString) return "N/A";
//     const date = new Date(isoString);
//     return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-GB");
//   }, []);

//   const debouncedSetSearch = useCallback(
//     debounce((value) => setDebouncedSearchText(value), 300),
//     []
//   );

//   const handleSearchChange = useCallback(
//     (e) => {
//       setSearchText(e.target.value);
//       debouncedSetSearch(e.target.value);
//     },
//     [debouncedSetSearch]
//   );

//   useEffect(() => {
//     if (data) {
//       const combined = [
//         ...data.getTasks,
//         ...data.getTasks2,
//         ...data.getTasks3,
//         ...data.getTasks4,
//         ...data.getTasks5,
//         ...data.getTasks6,
//         ...data.getTasks7,
//         ...data.getTasks8,
//         ...data.getTasks9,
//         ...data.getTasks10,
//       ];

//       setTasks((prevTasks) => [
//         ...new Map([...prevTasks, ...combined].map((task) => [task.id, task])).values(),
//       ]);
//     }
//   }, [data]);

//   const filteredTasks = useMemo(() => {
//     if (!tasks.length) return [];
//     if (!debouncedSearchText) return tasks;

//     const searchLower = debouncedSearchText.toLowerCase();
//     return tasks.filter(
//       (task) =>
//         task.jid?.toLowerCase().includes(searchLower) ||
//         task.articleId?.toLowerCase().includes(searchLower) ||
//         task.taskName?.toLowerCase().includes(searchLower) ||
//         task.user?.toLowerCase().includes(searchLower) ||
//         task.department?.toLowerCase().includes(searchLower)
//     );
//   }, [tasks, debouncedSearchText]);

//   const columns = useMemo(
//     () => [
//       { field: "id", headerName: "ID", width: 80 },
//       { field: "jid", headerName: "JID", width: 90 },
//       { field: "articleId", headerName: "Article ID", width: 90 },
//       { field: "taskName", headerName: "Task Name", width: 180 },
//       { field: "user", headerName: "User", width: 130 },
//       {
//         field: "dueDate",
//         headerName: "Due Date",
//         width: 130,
//         renderCell: (params) => formatDate(params.value),
//       },
//       {
//         field: "receivedDate",
//         headerName: "Received Date",
//         width: 130,
//         renderCell: (params) => formatDate(params.value),
//       },
//       { field: "journalComplexity", headerName: "Complexity", width: 120 },
//       { field: "department", headerName: "Department", width: 120 },
//       { field: "taskId", headerName: "Task ID", flex: 1 },
//       { field: "customer", headerName: "Customer", flex: 1 },
//     ],
//     [formatDate]
//   );

//   const handleScroll = async (model) => {
//     const { page: newPage, pageSize: newPageSize } = model;

//     setPaginationModel(model);
//     if (loadingMore) return;

//     if (newPageSize !== pageSize) {
//       setPage(0);
//       setTasks([]);
//     }

//     setLoadingMore(true);
//     await fetchMore({
//       variables: { page: newPage, size: newPageSize },
//       updateQuery: (prev, { fetchMoreResult }) => {
//         const previousData = prev || { getTasks: [], getTasks2: [] };

//         if (!fetchMoreResult) {
//           return previousData;
//         }

//         return {
//           ...fetchMoreResult,
//         };
//       },
//     });
//     setPage(newPage);
//     setLoadingMore(false);
//   };

//   if (loading && tasks.length === 0) return <p>Loading tasks...</p>;
//   if (error) return <p>Error loading tasks: {error.message}</p>;

//   return (
//     <Box sx={{ padding: 2 }}>
//       {/* Total Tasks Header */}
//       <Typography variant="h6" sx={{ mb: 1 }}>
//         Total Tasks Available (All DBs):{" "}
//         <strong>{data?.getTotalTasksCount ?? "..."}</strong>
//       </Typography>

//       {/* Search Bar */}
//       <Box sx={{ mb: 2, maxWidth: 300 }}>
//         <TextField
//           variant="outlined"
//           placeholder="Search Tasks"
//           value={searchText}
//           onChange={handleSearchChange}
//           size="small"
//           fullWidth
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search color="primary" />
//               </InputAdornment>
//             ),
//           }}
//         />
//       </Box>

//       {/* Data Grid */}
//       <DataGrid
//         rows={filteredTasks}
//         columns={columns}
//         paginationModel={paginationModel}
//         onPaginationModelChange={handleScroll}
//         checkboxSelection
//         disableRowSelectionOnClick
//         autoHeight
//         sx={{
//           "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
//           "& .MuiDataGrid-cell": { borderBottom: "1px solid #e0e0e0" },
//           "& .MuiDataGrid-root": {
//             border: "1px solid #e0e0e0",
//             borderRadius: "8px",
//           },
//         }}
//       />

//       {/* Loading Spinner */}
//       {loadingMore && (
//         <Box sx={{ textAlign: "center", mt: 2 }}>
//           <CircularProgress size={30} />
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default TaskList;




















// import React, { useState, useMemo, useCallback, useEffect } from "react";
// import { useQuery, gql } from "@apollo/client";
// import { DataGrid } from "@mui/x-data-grid";
// import { TextField, Box, InputAdornment, CircularProgress } from "@mui/material";
// import { Search } from "@mui/icons-material";
// import debounce from "lodash/debounce";


// const GET_TASKS = gql`
//  query GetTasks($page: Int!, $size: Int!) {
//    getTasks(page: $page, size: $size) {
//      id
//      jid
//      articleId
//      taskName
//      user
//      dueDate
//      receivedDate
//      journalComplexity
//      department
//      taskId
//      customer
//    }
//    getTasks2(page: $page, size: $size) {
//      id
//      jid
//      articleId
//      taskName
//      user
//      dueDate
//      receivedDate
//      journalComplexity
//      department
//      taskId
//      customer
//    }
//      getTasks3(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks4(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks5(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks6(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks7(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks8(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks9(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//     getTasks10(page: $page, size: $size) {
//       id
//       jid
//       articleId
//       taskName
//       user
//       dueDate
//       receivedDate
//       journalComplexity
//       department
//       taskId
//       customer
//     }
//       getTotalTasksCount
//  }
// `;


// const TaskList = () => {
//  const [page, setPage] = useState(0);
//  const [pageSize] = useState(10);
//  const [tasks, setTasks] = useState([]);
//  const [searchText, setSearchText] = useState("");
//  const [debouncedSearchText, setDebouncedSearchText] = useState("");
//  const [loadingMore, setLoadingMore] = useState(false);
//  const [paginationModel, setPaginationModel] = useState({
//    page: 0,
//    pageSize: 10
//  });


//  const { loading, error, data, fetchMore } = useQuery(GET_TASKS, {
//    variables: { page, size: pageSize },
//    fetchPolicy: "cache-and-network",
//  });


//  const formatDate = useCallback((isoString) => {
//    if (!isoString) return "N/A";
//    const date = new Date(isoString);
//    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-GB");
//  }, []);

//  const debouncedSetSearch = useCallback(
//    debounce((value) => setDebouncedSearchText(value), 300),
//    []
//  );


//  const handleSearchChange = useCallback(
//    (e) => {
//      setSearchText(e.target.value);
//      debouncedSetSearch(e.target.value);
//    },
//    [debouncedSetSearch]
//  );


//  useEffect(() => {
//   if (data) {
//     const combined = [
//       ...data.getTasks,
//       ...data.getTasks2,
//       ...data.getTasks3,
//       ...data.getTasks4,
//       ...data.getTasks5,
//       ...data.getTasks6,
//       ...data.getTasks7,
//       ...data.getTasks8,
//       ...data.getTasks9,
//       ...data.getTasks10,
//     ];

//     setTasks((prevTasks) => [
//       ...new Map([...prevTasks, ...combined].map((task) => [task.id, task])).values(),
//     ]);
//   }
// }, [data]);





//  const filteredTasks = useMemo(() => {
//    if (!tasks.length) return [];
//    if (!debouncedSearchText) return tasks;


//    const searchLower = debouncedSearchText.toLowerCase();
//    return tasks.filter(
//      (task) =>
//        task.jid?.toLowerCase().includes(searchLower) ||
//        task.articleId?.toLowerCase().includes(searchLower) ||
//        task.taskName?.toLowerCase().includes(searchLower) ||
//        task.user?.toLowerCase().includes(searchLower) ||
//        task.department?.toLowerCase().includes(searchLower)
//    );
//  }, [tasks, debouncedSearchText]);




//  const columns = useMemo(
//    () => [
//      { field: "id", headerName: "ID", width: 80 },
//      { field: "jid", headerName: "JID", width: 90 },
//      { field: "articleId", headerName: "Article ID", width: 90 },
//      { field: "taskName", headerName: "Task Name", width: 180 },
//      { field: "user", headerName: "User", width: 130 },
//      {
//        field: "dueDate",
//        headerName: "Due Date",
//        width: 130,
//        renderCell: (params) => formatDate(params.value),
//      },
//      {
//        field: "receivedDate",
//        headerName: "Received Date",
//        width: 130,
//        renderCell: (params) => formatDate(params.value),
//      },
//      { field: "journalComplexity", headerName: "Complexity", width: 120 },
//      { field: "department", headerName: "Department", width: 120 },
//      { field: "taskId", headerName: "Task ID", flex: 1 },
//      {field: "customer", headerName: "Customer", flex:1 },
//    ],
//    [formatDate]
//  );


//  const handleScroll = async (model) => {
//    const { page: newPage, pageSize: newPageSize } = model;

//    setPaginationModel(model);
 
//    if (loadingMore) return;
//    if (newPageSize !== pageSize) {
//      setPage(0); 
//      setTasks([]);
//    }
//     setLoadingMore(true);
//    await fetchMore({
//      variables: { page: newPage, size: newPageSize },
//      updateQuery: (prev, { fetchMoreResult }) => {
//        console.log("Prev data:", prev);
//        console.log("FetchMoreResult:", fetchMoreResult);

//        const previousData = prev || { getTasks: [], getTasks2: [] };

//        if (!fetchMoreResult || !fetchMoreResult.getTasks || !fetchMoreResult.getTasks2) {
//          return previousData;
//        }

//        if (newPageSize !== pageSize) {
//          return {
//            getTasks: fetchMoreResult.getTasks,
//            getTasks2: fetchMoreResult.getTasks2,
//          };
//        }
//         return {
//          getTasks: [...(previousData.getTasks || []), ...fetchMoreResult.getTasks],
//          getTasks2: [...(previousData.getTasks2 || []), ...fetchMoreResult.getTasks2],
//        };
//      },
//    });
//     setPage(newPage);
//    setLoadingMore(false);
//  };
 


//  if (loading && tasks.length === 0) return <p>Loading tasks...</p>;
//  if (error) return <p>Error loading tasks: {error.message}</p>;


//  return (
//    <Box sx={{ padding: 2 }}>
//      {/* Search Bar */}
//      <Box sx={{ mb: 2, maxWidth: 300 }}>
//        <TextField
//          variant="outlined"
//          placeholder="Search Tasks"
//          value={searchText}
//          onChange={handleSearchChange}
//          size="small"
//          fullWidth
//          InputProps={{
//            startAdornment: (
//              <InputAdornment position="start">
//                <Search color="primary" />
//              </InputAdornment>
//            ),
//          }}
//        />
//      </Box>


//      {/* Data Grid with Lazy Loading */}
//      <DataGrid
//        rows={filteredTasks}
//        columns={columns}
//        paginationModel={paginationModel}
//        onPaginationModelChange={handleScroll}
//       //  pageSizeOptions={[10, 20, 50]}
//        checkboxSelection
//        disableRowSelectionOnClick
//        autoHeight
//        sx={{
//          "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
//          "& .MuiDataGrid-cell": { borderBottom: "1px solid #e0e0e0" },
//          "& .MuiDataGrid-root": { border: "1px solid #e0e0e0", borderRadius: "8px" },
//        }}
//      />


//      {/* Loading Indicator */}
//      {loadingMore && (
//        <Box sx={{ textAlign: "center", mt: 2 }}>
//          <CircularProgress size={30} />
//        </Box>
//      )}
//    </Box>
//  );
// };


// export default TaskList;










// import React, { useState, useMemo, useCallback, useEffect } from "react";
// import { useQuery, gql } from "@apollo/client";
// import { DataGrid } from "@mui/x-data-grid";
// import { TextField, Box, InputAdornment, CircularProgress } from "@mui/material";
// import { Search } from "@mui/icons-material";
// import debounce from "lodash/debounce";

// const GET_TASKS = gql`
//   query GetTasks($page: Int!, $size: Int!) {
//     getTasks(page: $page, size: $size) { id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer }
//     getTasks2(page: $page, size: $size) { id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer }
//     getTasks3(page: $page, size: $size) { id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer }
//     getTasks4(page: $page, size: $size) { id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer }
//     getTasks5(page: $page, size: $size) { id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer }
//     getTasks6(page: $page, size: $size) { id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer }
//     getTasks7(page: $page, size: $size) { id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer }
//     getTasks8(page: $page, size: $size) { id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer }
//     getTasks9(page: $page, size: $size) { id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer }
//     getTasks10(page: $page, size: $size) { id jid articleId taskName user dueDate receivedDate journalComplexity department taskId customer }
//     getTotalTasksCount
//   }
// `;

// const TaskList = () => {
//   const [page, setPage] = useState(0);
//   const [pageSize] = useState(10);
//   const [tasks, setTasks] = useState([]);
//   const [searchText, setSearchText] = useState("");
//   const [debouncedSearchText, setDebouncedSearchText] = useState("");
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
//   const [lastUpdated, setLastUpdated] = useState(null); // ✅ New state for last updated time

//   const { loading, error, data, fetchMore } = useQuery(GET_TASKS, {
//     variables: { page, size: pageSize },
//     fetchPolicy: "cache-and-network",
//   });

//   const formatDate = useCallback((isoString) => {
//     if (!isoString) return "N/A";
//     const date = new Date(isoString);
//     return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString("en-GB");
//   }, []);

//   const debouncedSetSearch = useCallback(
//     debounce((value) => setDebouncedSearchText(value), 300),
//     []
//   );

//   const handleSearchChange = useCallback(
//     (e) => {
//       setSearchText(e.target.value);
//       debouncedSetSearch(e.target.value);
//     },
//     [debouncedSetSearch]
//   );

//   useEffect(() => {
//     if (data) {
//       const combined = [
//         ...data.getTasks,
//         ...data.getTasks2,
//         ...data.getTasks3,
//         ...data.getTasks4,
//         ...data.getTasks5,
//         ...data.getTasks6,
//         ...data.getTasks7,
//         ...data.getTasks8,
//         ...data.getTasks9,
//         ...data.getTasks10,
//       ];

//       setTasks((prevTasks) => [
//         ...new Map([...prevTasks, ...combined].map((task) => [task.id, task])).values(),
//       ]);

//       setLastUpdated(new Date()); // ✅ Set last updated time
//     }
//   }, [data]);

//   const filteredTasks = useMemo(() => {
//     if (!tasks.length) return [];
//     if (!debouncedSearchText) return tasks;

//     const searchLower = debouncedSearchText.toLowerCase();
//     return tasks.filter(
//       (task) =>
//         task.jid?.toLowerCase().includes(searchLower) ||
//         task.articleId?.toLowerCase().includes(searchLower) ||
//         task.taskName?.toLowerCase().includes(searchLower) ||
//         task.user?.toLowerCase().includes(searchLower) ||
//         task.department?.toLowerCase().includes(searchLower)
//     );
//   }, [tasks, debouncedSearchText]);

//   const columns = useMemo(() => [
//     { field: "id", headerName: "ID", width: 80 },
//     { field: "jid", headerName: "JID", width: 90 },
//     { field: "articleId", headerName: "Article ID", width: 90 },
//     { field: "taskName", headerName: "Task Name", width: 180 },
//     { field: "user", headerName: "User", width: 130 },
//     {
//       field: "dueDate",
//       headerName: "Due Date",
//       width: 130,
//       renderCell: (params) => formatDate(params.value),
//     },
//     {
//       field: "receivedDate",
//       headerName: "Received Date",
//       width: 130,
//       renderCell: (params) => formatDate(params.value),
//     },
//     { field: "journalComplexity", headerName: "Complexity", width: 120 },
//     { field: "department", headerName: "Department", width: 120 },
//     { field: "taskId", headerName: "Task ID", flex: 1 },
//     { field: "customer", headerName: "Customer", flex: 1 },
//   ], [formatDate]);

//   const handleScroll = async (model) => {
//     const { page: newPage, pageSize: newPageSize } = model;

//     setPaginationModel(model);

//     if (loadingMore) return;
//     if (newPageSize !== pageSize) {
//       setPage(0);
//       setTasks([]);
//     }

//     setLoadingMore(true);
//     await fetchMore({
//       variables: { page: newPage, size: newPageSize },
//       updateQuery: (prev, { fetchMoreResult }) => {
//         const previousData = prev || { getTasks: [], getTasks2: [] };
//         if (!fetchMoreResult || !fetchMoreResult.getTasks || !fetchMoreResult.getTasks2) {
//           return previousData;
//         }

//         if (newPageSize !== pageSize) {
//           return {
//             getTasks: fetchMoreResult.getTasks,
//             getTasks2: fetchMoreResult.getTasks2,
//           };
//         }

//         return {
//           getTasks: [...(previousData.getTasks || []), ...fetchMoreResult.getTasks],
//           getTasks2: [...(previousData.getTasks2 || []), ...fetchMoreResult.getTasks2],
//         };
//       },
//     });

//     setPage(newPage);
//     setLoadingMore(false);
//   };

//   if (loading && tasks.length === 0) return <p>Loading tasks...</p>;
//   if (error) return <p>Error loading tasks: {error.message}</p>;

//   return (
//     <Box sx={{ padding: 2 }}>
//       {/* Search Bar */}
//       <Box sx={{ mb: 2, maxWidth: 300 }}>
//         <TextField
//           variant="outlined"
//           placeholder="Search Tasks"
//           value={searchText}
//           onChange={handleSearchChange}
//           size="small"
//           fullWidth
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search color="primary" />
//               </InputAdornment>
//             ),
//           }}
//         />
//       </Box>

//       {/* ✅ Last Updated Timestamp */}
//       {lastUpdated && (
//         <Box sx={{ mb: 1, fontSize: 14, color: "gray" }}>
//           Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//         </Box>
//       )}

//       {/* Data Grid with Lazy Loading */}
//       <DataGrid
//         rows={filteredTasks}
//         columns={columns}
//         paginationModel={paginationModel}
//         onPaginationModelChange={handleScroll}
//         checkboxSelection
//         disableRowSelectionOnClick
//         autoHeight
//         sx={{
//           "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
//           "& .MuiDataGrid-cell": { borderBottom: "1px solid #e0e0e0" },
//           "& .MuiDataGrid-root": { border: "1px solid #e0e0e0", borderRadius: "8px" },
//         }}
//       />

//       {/* Loading Indicator */}
//       {loadingMore && (
//         <Box sx={{ textAlign: "center", mt: 2 }}>
//           <CircularProgress size={30} />
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default TaskList;




