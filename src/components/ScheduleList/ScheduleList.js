import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import useGetAllOrder from '../../hooks/useGetAllOrder';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Search from '@mui/icons-material/Search';
import FormApi from '../../api/formApi';
import { currentHost } from '../../utils/path';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));


const theme = createTheme({
    palette: {
        primary: {
            light: '#757ce8',
            main: '#202C45',
            dark: '#002884',
            contrastText: '#fff',
        },
        secondary: {
            light: '#ff7961',
            main: '#E81C2E',
            dark: '#ba000d',
            contrastText: '#fff',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            'Barlow',
            '"Segoe UI"',
            'Roboto',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
});

function Row(props) {
    const { row } = props;
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    {new Date(row.createdAt).toLocaleDateString('pt-PT')}
                </TableCell>
                <TableCell align="right">
                    {new Date(row.dateAppointment).toLocaleDateString('pt-PT')}
                </TableCell>
                <TableCell align="right">
                    {row.timeAppointment}
                </TableCell>
                <TableCell align="right">
                    {row.totalPrice.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                    })}
                </TableCell>
                <TableCell align="right">
                    {row.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                </TableCell>
                <TableCell align="right">
                    <Button variant="text" color="secondary" onClick={() => props.onClick(row._id)}>
                        Xem chi tiết
                    </Button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Dịch vụ đã chọn
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tên dịch vụ</TableCell>
                                        <TableCell align="right">Giá tiền</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.listService.map((row) => (
                                        <TableRow key={row.id}>
                                            <StyledTableCell component="th" scope="row">
                                                {row.productName}
                                            </StyledTableCell>
                                            <StyledTableCell align="right">{row.price.toLocaleString('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            })}</StyledTableCell>
                                        </TableRow>
                                    ))}
                                    {row.combo ? 
                                        <TableRow key={row.id}>
                                            <StyledTableCell component="th" scope="row">
                                                {row.combo==='combo1'? 'Gói cơ bản' : row.combo==='combo2'? 'Gói premium' : 'Gói super premium'}
                                            </StyledTableCell>
                                            <StyledTableCell align="right">{row.priceCombo.toLocaleString('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            })}</StyledTableCell>
                                        </TableRow>
                                        : null
                                    }
                                    {row.carSize!=='carSmall' ? 
                                        <TableRow key={row.id}>
                                            <StyledTableCell component="th" scope="row">
                                                {row.carSize==='carMedium'? 'Phụ thu xe cỡ vừa' : 'Phụ thu xe cỡ lớn'}
                                            </StyledTableCell>
                                            <StyledTableCell align="right">{(row.carSize==='carMedium'? 100000 : 200000).toLocaleString('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            })}</StyledTableCell>
                                        </TableRow>
                                        : null
                                    }
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}
export default function FullWidthGrid() {
    const [page, setPage] = useState(0);
    const navigate = useNavigate();
    const [rowsPerPage, setRowsPerPage] = useState(5);
    let [loading, ordersGet] = useGetAllOrder();
    const [orders, setOrders] = useState(null);
    const [textFind, setTextFind] = useState("");

    useEffect(() => {
        console.log(loading);
        setOrders(ordersGet);
    },[loading])
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            FormApi.findOrderByEmail(textFind)
            .then((res)=>{
                setOrders(res);
            })
            .catch(err=>{
                console.log(err);
            });
        }
    }
    const handleClickIconFind = ()=>{
        FormApi.findOrderByEmail(textFind)
        .then((res)=>{
            setOrders(res);
        })
        .catch(err=>{
            console.log(err);
        });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleClick = (id) => {
        navigate(`${currentHost()}/appointmentSchedule/${id}`);
        // alert(id);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };


    if (loading==true) return <>
        <h2 style={{ textAlign: "center" }}>Đang tải danh sách lịch hẹn</h2>
        <Stack alignItems="center" mt={10} mb={10}>
            <CircularProgress size={80} />
        </Stack>
    </>;
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container component="main" maxWidth="md">
                <TextField
                    id="input-with-icon-textfield"
                    label="Tìm kiếm lịch hẹn ( tìm qua email đặt lịch)"
                    fullWidth
                    onChange={(e) => {
                        setTextFind(e.target.value);
                        if(e.target.value.length===0) setOrders(ordersGet);
                    }}
                    style={{ marginBottom: 20 }}
                    onKeyDown={handleKeyDown}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment
                                style={{ cursor: 'pointer' }}
                                position="start" onClick={handleClickIconFind}>
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    variant="outlined"
                />
                <Paper sx={{ width: '100%' }}>
                    <TableContainer component={Paper}>
                        <Table stickyHeader aria-label="collapsible table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell />
                                    <StyledTableCell>Ngày đặt</StyledTableCell>
                                    <StyledTableCell align="right">Ngày hẹn</StyledTableCell>
                                    <StyledTableCell align="right">Thời gian hẹn</StyledTableCell>
                                    <StyledTableCell align="right">Tổng tiền</StyledTableCell>
                                    <StyledTableCell align="right">Thanh toán</StyledTableCell>
                                    <StyledTableCell align="right">Kiểm tra</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <Row key={row._id} row={row} onClick={handleClick} />
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[1, 2, 5]}
                        component="div"
                        count={orders.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
                        labelRowsPerPage="Số dòng trên trang"
                    />
                </Paper>
            </Container>
        </ThemeProvider>
    );
}