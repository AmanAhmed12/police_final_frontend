// "use client";

// import React, { useEffect, useState } from 'react';
// import {
//     Typography,
//     Box,
//     Paper,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     IconButton,
//     Chip,
//     Button,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     TextField,
//     MenuItem,
//     Select,
//     InputLabel,
//     FormControl,
//     SelectChangeEvent
// } from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddIcon from '@mui/icons-material/Add';
// import { deleteUser, getUsers, registerUser, updateUser } from "@/services/authService";
// import { useSelector } from 'react-redux';
// import { RootState } from '@/lib/store';

// // Define User Interface
// interface User {
//     id: number;
//     name: string;
//     email: string;
//     role: string;
//     status: string;
// }

// export default function UsersPage() {
//     const [users, setUsers] = useState<User[]>([]);

//     // State Management
//     const [openDialog, setOpenDialog] = useState(false);
//     const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//     const [currentUser, setCurrentUser] = useState<User | null>(null); // For Edit
//     const [userToDelete, setUserToDelete] = useState<number | null>(null);

//     // Form State (could be separate or derived from currentUser)
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         role: '',
//         status: ''
//     });
//     const [loading, setLoading] = useState(false);

//     const fetchUsers = async () => {
//         setLoading(true);
//         try {
//             const data = await getUsers(token);
//             setUsers(data);
//         } catch (error: any) {
//             alert(error.message || "Failed to load users");
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchUsers();
//     }, []);

//     // Handle Open/Close Dialogs
//     const handleOpenDialog = (user?: User) => {
//         if (user) {
//             // Edit Mode
//             setCurrentUser(user);
//             setFormData({
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 status: user.status
//             });
//         } else {
//             // Create Mode
//             setCurrentUser(null);
//             setFormData({
//                 name: '',
//                 email: '',
//                 role: '',
//                 status: ''
//             });
//         }
//         setOpenDialog(true);
//     };

//     const handleCloseDialog = () => {
//         setOpenDialog(false);
//         setCurrentUser(null);
//     };

//     // Handle Form Changes
//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleSelectChange = (e: SelectChangeEvent) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name as string]: value }));
//     };

//     // Handle Save (Create or Update)
//     const handleSave = async () => {
//         setLoading(true);
//         try {
//             if (currentUser) {
//                 await updateUser(currentUser.id, formData, token);
//             } else {
//                 await registerUser(formData);
//             }

//             await fetchUsers(); // reload from backend after create/update
//             handleCloseDialog();
//         } catch (error: any) {
//             alert(error.message || "Operation failed");
//         } finally {
//             setLoading(false);
//         }

//     };

//     // Handle Delete
//     const handleDeleteClick = (id: number) => {
//         setUserToDelete(id);
//         setOpenDeleteDialog(true);
//     };

//     const handleConfirmDelete = async () => {
//         if (userToDelete === null) return;

//         setLoading(true);
//         try {
//             await deleteUser(userToDelete, token);
//             await fetchUsers(); // refresh table
//             setOpenDeleteDialog(false);
//             setUserToDelete(null);
//         } catch (error: any) {
//             alert(error.message || "Failed to delete user");
//         } finally {
//             setLoading(false);
//         }

//     };

//     return (
//         <Box>
//             <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//                 <Typography variant="h4" fontWeight="bold" color="primary">
//                     Active Users
//                 </Typography>
//                 <Button
//                     variant="contained"
//                     startIcon={<AddIcon />}
//                     onClick={() => handleOpenDialog()}
//                 >
//                     Add User
//                 </Button>
//             </Box>

//             <Paper sx={{ mt: 3, overflow: 'hidden' }}>
//                 <TableContainer>
//                     <Table>
//                         <TableHead>
//                             <TableRow>
//                                 <TableCell>Name</TableCell>
//                                 <TableCell>Email</TableCell>
//                                 <TableCell>Role</TableCell>
//                                 <TableCell>Status</TableCell>
//                                 <TableCell align="right">Actions</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {users.length === 0 ? (
//                                 <TableRow key="no-users">
//                                     <TableCell colSpan={5} align="center">{"No users found."}</TableCell>
//                                 </TableRow>
//                             ) : (
//                                 users.map((user, index) => (
//                                     // Use a combination of id and index to guarantee a unique key
//                                     <TableRow key={`${user.id}-${index}`} hover>
//                                         <TableCell>{user.name}</TableCell>
//                                         <TableCell>{user.email}</TableCell>
//                                         <TableCell>{user.role}</TableCell>
//                                         <TableCell>
//                                             <Chip
//                                                 label={user.status}
//                                                 color={user.status === 'Active' ? 'success' : 'default'}
//                                                 size="small"
//                                                 variant="outlined"
//                                             />
//                                         </TableCell>
//                                         <TableCell align="right">
//                                             <IconButton
//                                                 size="small"
//                                                 color="primary"
//                                                 onClick={() => handleOpenDialog(user)}
//                                             >
//                                                 <EditIcon />
//                                             </IconButton>
//                                             <IconButton
//                                                 size="small"
//                                                 color="error"
//                                                 onClick={() => handleDeleteClick(user.id)}
//                                             >
//                                                 <DeleteIcon />
//                                             </IconButton>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))
//                             )}
//                         </TableBody>




//                     </Table>
//                 </TableContainer>
//             </Paper>

//             {/* Create/Edit User Dialog */}
//             <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
//                 <DialogTitle>{currentUser ? 'Edit User' : 'Add New User'}</DialogTitle>
//                 <DialogContent>
//                     <Box component="form" sx={{ mt: 1 }}>
//                         <TextField
//                             margin="normal"
//                             fullWidth
//                             label="Name"
//                             name="name"
//                             value={formData.name}
//                             onChange={handleInputChange}
//                         />
//                         <TextField
//                             margin="normal"
//                             fullWidth
//                             label="Email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                         />
//                         <FormControl fullWidth margin="normal">
//                             <InputLabel>Role</InputLabel>
//                             <Select
//                                 name="role"
//                                 value={formData.role}
//                                 label="Role"
//                                 onChange={handleSelectChange}
//                             >
//                                 <MenuItem value="Citizen">Citizen</MenuItem>
//                                 <MenuItem value="Officer">Officer</MenuItem>
//                                 <MenuItem value="Admin">Admin</MenuItem>
//                             </Select>
//                         </FormControl>
//                         <FormControl fullWidth margin="normal">
//                             <InputLabel>Status</InputLabel>
//                             <Select
//                                 name="status"
//                                 value={formData.status}
//                                 label="Status"
//                                 onChange={handleSelectChange}
//                             >
//                                 <MenuItem value="Active">Active</MenuItem>
//                                 <MenuItem value="Inactive">Inactive</MenuItem>
//                                 <MenuItem value="Suspended">Suspended</MenuItem>
//                             </Select>
//                         </FormControl>
//                     </Box>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
//                     <Button onClick={handleSave} variant="contained" color="primary">Save</Button>
//                 </DialogActions>
//             </Dialog>

//             {/* Delete Confirmation Dialog */}
//             <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
//                 <DialogTitle>Confirm Delete</DialogTitle>
//                 <DialogContent>
//                     <Typography>
//                         Are you sure you want to delete this user? This action cannot be undone.
//                     </Typography>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Cancel</Button>
//                     <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
//                 </DialogActions>
//             </Dialog>
//         </Box>
//     );
// }
"use client";

import React, { useEffect, useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    SelectChangeEvent,
    InputAdornment,
    Snackbar,
    Alert,
    TablePagination,
    Grid,
    Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ChatIcon from '@mui/icons-material/Chat';
import MessageIcon from '@mui/icons-material/Message';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { deleteUser, getUsers, registerUser, updateUser } from "@/services/authService";
import { sendNotification, getChatHistory, Notification } from "@/app/services/notificationService";
import ChatHistoryModal from "@/components/common/ChatHistoryModal";
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { format } from 'date-fns';
import {
    CircularProgress,
    Tooltip,
    IconButton as MuiIconButton,
    alpha
} from '@mui/material';

// Define User Interface
interface User {
    id: number;
    fullName: string;
    nic: string;
    username: string;
    email: string;
    role: string;
    status: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const loggedInUser = useSelector((state: RootState) => state.auth.user);
    const token = loggedInUser?.token;

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [formData, setFormData] = useState({
        fullName: '',
        nic: '',
        username: '',
        email: '',
        role: '',
        status: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Messaging State
    const [openMessageDialog, setOpenMessageDialog] = useState(false);
    const [targetUser, setTargetUser] = useState<User | null>(null);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            (user.nic?.toLowerCase() || "").includes(query) ||
            (user.username?.toLowerCase() || "").includes(query) ||
            (user.email?.toLowerCase() || "").includes(query) ||
            (user.fullName?.toLowerCase() || "").includes(query)
        );
    });
    const [messageText, setMessageText] = useState("");
    const [chatHistory, setChatHistory] = useState<Notification[]>([]);
    const [fetchingHistory, setFetchingHistory] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    // History Modal State
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyTarget, setHistoryTarget] = useState<{ id: number; fullName: string } | null>(null);

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers(token);
            setUsers(data);
        } catch (error: any) {
            alert(error.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Normalize Role and Status
    const normalizeRole = (role: string) => {
        if (!role) return '';
        const formatted = role.toLowerCase();
        if (formatted === 'citizen') return 'Citizen';
        if (formatted === 'officer') return 'Officer';
        if (formatted === 'admin') return 'Admin';
        return '';
    };

    const normalizeStatus = (status: string) => {
        if (!status) return '';
        const formatted = status.toLowerCase();
        if (formatted === 'active') return 'Active';
        if (formatted === 'inactive') return 'Inactive';
        if (formatted === 'suspended') return 'Suspended';
        return '';
    };

    // Open dialog for add/edit
    const handleOpenDialog = (user?: User) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                fullName: user.fullName,
                nic: user.nic,
                username: user.username,
                email: user.email,
                role: normalizeRole(user.role),
                status: normalizeStatus(user.status),
                password: '',
                confirmPassword: ''
            });
        } else {
            setCurrentUser(null);
            setFormData({
                fullName: '',
                nic: '',
                username: '',
                email: '',
                role: '',
                status: '',
                password: '',
                confirmPassword: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentUser(null);
        setFormData({
            fullName: '',
            nic: '',
            username: '',
            email: '',
            role: '',
            status: '',
            password: '',
            confirmPassword: ''
        });
    };

    const handleOpenMessageDialog = async (user: User) => {
        setTargetUser(user);
        setOpenMessageDialog(true);
        setMessageText("");
        setFetchingHistory(true);
        try {
            const history = await getChatHistory(user.id, token);
            setChatHistory(history);
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
        } finally {
            setFetchingHistory(false);
        }
    };

    const handleSendMessage = async () => {
        if (!targetUser || !messageText.trim()) return;

        setSendingMessage(true);
        try {
            await sendNotification(targetUser.id, messageText, token);
            setMessageText("");
            // Refresh history
            const history = await getChatHistory(targetUser.id, token);
            setChatHistory(history);
            setSnackbarMessage(`Message sent to ${targetUser.fullName}`);
            setSnackbarOpen(true);
        } catch (error: any) {
            alert(error.message || "Failed to send message");
        } finally {
            setSendingMessage(false);
        }
    };

    // Input handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    // Save user (add/update)
    const handleSave = async () => {
        if (!currentUser && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            if (currentUser) {
                const updateData: any = { ...formData };
                if (!formData.password) {
                    delete updateData.password;
                    delete updateData.confirmPassword;
                }
                await updateUser(currentUser.id, updateData, token);
            } else {
                await registerUser(formData);
            }
            await fetchUsers();
            handleCloseDialog();
            setSnackbarMessage(currentUser ? "User updated successfully" : "User created successfully");
            setSnackbarOpen(true);
        } catch (error: any) {
            alert(error.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    // Delete handlers
    const handleDeleteClick = (id: number) => {
        setUserToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (userToDelete === null) return;
        setLoading(true);
        try {
            await deleteUser(userToDelete, token);
            await fetchUsers();
            setOpenDeleteDialog(false);
            setUserToDelete(null);
            setSnackbarMessage("User deleted successfully");
            setSnackbarOpen(true);
        } catch (error: any) {
            alert(error.message || "Failed to delete user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Active Users
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add User
                </Button>
            </Box>

            {/* Search Section */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            size="medium"
                            label="Search Users"
                            variant="outlined"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Type NIC, Username, or Email to search..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                                            <ClearAllIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Users Table */}
            <Paper sx={{ mt: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Full Name</TableCell>
                                <TableCell>NIC</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedUsers.length === 0 ? (
                                <TableRow key="no-users">
                                    <TableCell colSpan={7} align="center">No users found.</TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user, index) => (
                                    <TableRow key={`${user.id}-${index}`} hover>
                                        <TableCell>{user.fullName}</TableCell>
                                        <TableCell>{user.nic}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{normalizeRole(user.role)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={normalizeStatus(user.status)}
                                                color={normalizeStatus(user.status) === 'Active' ? 'success' : 'default'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="secondary"
                                                title="View History"
                                                onClick={() => {
                                                    setHistoryTarget({ id: user.id, fullName: user.fullName });
                                                    setHistoryOpen(true);
                                                }}
                                                sx={{ mr: 1 }}
                                            >
                                                <HistoryIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="info"
                                                title="Send Message"
                                                onClick={() => handleOpenMessageDialog(user)}
                                                sx={{ mr: 1 }}
                                            >
                                                <ChatIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog(user)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(user.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Add/Edit User Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{currentUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="NIC"
                            name="nic"
                            value={formData.nic}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={!!currentUser} // Disable if editing
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!!currentUser} // Disable if editing
                        />
                        {!currentUser && (
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required={!currentUser}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )}
                        {!currentUser && (
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required={!currentUser}
                                error={formData.password !== formData.confirmPassword}
                                helperText={formData.password !== formData.confirmPassword ? "Passwords do not match" : ""}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )}
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                label="Role"
                                onChange={handleSelectChange}
                            >
                                <MenuItem value="Citizen">Citizen</MenuItem>
                                <MenuItem value="Officer">Officer</MenuItem>
                                <MenuItem value="Admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                label="Status"
                                onChange={handleSelectChange}
                            >
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                                <MenuItem value="Suspended">Suspended</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={10000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            {/* Message User Dialog */}
            <Dialog
                open={openMessageDialog}
                onClose={() => setOpenMessageDialog(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        maxHeight: '85vh',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle component="div" sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <MessageIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="800">Messages</Typography>
                            {targetUser && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: -0.5 }}>
                                    Conversation with {targetUser.fullName}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Box>
                        <Tooltip title="Refresh">
                            <MuiIconButton size="small" onClick={() => handleOpenMessageDialog(targetUser!)} sx={{ mr: 1 }}>
                                <RefreshIcon fontSize="small" />
                            </MuiIconButton>
                        </Tooltip>
                        <MuiIconButton size="small" onClick={() => setOpenMessageDialog(false)}>
                            <CloseIcon fontSize="small" />
                        </MuiIconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0, bgcolor: alpha('#f4f7fe', 0.4), position: 'relative' }}>
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', minHeight: 450 }}>
                        {fetchingHistory && chatHistory.length === 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 2 }}>
                                <CircularProgress size={32} thickness={5} />
                                <Typography variant="body2" color="textSecondary">Fetching conversation...</Typography>
                            </Box>
                        ) : chatHistory.length === 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, opacity: 0.5 }}>
                                <MessageIcon sx={{ fontSize: 64, mb: 2, color: 'text.disabled' }} />
                                <Typography variant="h6" color="textSecondary">Start a chat</Typography>
                                <Typography variant="body2" color="textSecondary">No messages yet with {targetUser?.fullName}</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {[...chatHistory].reverse().map((chat) => {
                                    const isMe = Number(chat.sender.id) === Number(loggedInUser?.id) ||
                                        (loggedInUser?.fullName && chat.sender.fullName === loggedInUser.fullName);
                                    return (
                                        <Box
                                            key={chat.id}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: isMe ? 'flex-end' : 'flex-start',
                                                width: '100%'
                                            }}
                                        >
                                            <Box sx={{
                                                display: 'flex',
                                                gap: 1.5,
                                                maxWidth: '85%',
                                                flexDirection: isMe ? 'row-reverse' : 'row',
                                                alignItems: 'flex-start'
                                            }}>
                                                <Avatar
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        bgcolor: isMe ? 'primary.main' : 'secondary.main',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 'bold',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                >
                                                    {chat.sender.fullName.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: isMe ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                                                            bgcolor: isMe ? 'primary.main' : 'background.paper',
                                                            color: isMe ? 'white' : 'text.primary',
                                                            boxShadow: isMe
                                                                ? '0 4px 12px rgba(40,102,242,0.2)'
                                                                : '0 2px 8px rgba(0,0,0,0.04)',
                                                            border: isMe ? 'none' : '1px solid',
                                                            borderColor: 'divider',
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <Typography variant="caption" fontWeight="900" display="block" sx={{ mb: 0.75, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5, opacity: isMe ? 0.8 : 0.6 }}>
                                                            {chat.sender.fullName}{isMe ? " (YOU)" : ""}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ lineHeight: 1.6, wordBreak: 'break-word' }}>
                                                            {chat.message}
                                                        </Typography>
                                                    </Paper>
                                                    <Typography variant="caption" sx={{ mt: 0.5, fontSize: '0.65rem', color: 'text.secondary', px: 0.5 }}>
                                                        {format(new Date(chat.createdAt), 'hh:mm a')}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <Box sx={{
                    p: 2.5,
                    bgcolor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            placeholder={`Type a message to ${targetUser?.fullName.split(' ')[0]}...`}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            disabled={sendingMessage}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            InputProps={{
                                sx: {
                                    borderRadius: 3,
                                    bgcolor: alpha('#f4f7fe', 0.5),
                                    '& fieldset': { border: 'none' },
                                    '&:hover fieldset': { border: 'none' },
                                    '&.Mui-focused fieldset': { border: 'none' },
                                    py: 1.5
                                }
                            }}
                        />
                        <Tooltip title="Send Message">
                            <span>
                                <MuiIconButton
                                    color="primary"
                                    onClick={handleSendMessage}
                                    disabled={!messageText.trim() || sendingMessage}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        width: 48,
                                        height: 48,
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'white' },
                                        boxShadow: '0 4px 12px rgba(40,102,242,0.3)'
                                    }}
                                >
                                    {sendingMessage ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
                                </MuiIconButton>
                            </span>
                        </Tooltip>
                    </Box>
                </Box>
            </Dialog>

            <ChatHistoryModal
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                initialTarget={historyTarget}
            />
        </Box>
    );
}
