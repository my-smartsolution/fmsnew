import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import IconUserPlus from '../../../components/Icon/IconUserPlus';
import IconListCheck from '../../../components/Icon/IconListCheck';
import IconLayoutGrid from '../../../components/Icon/IconLayoutGrid';
import IconSearch from '../../../components/Icon/IconSearch';
import IconUser from '../../../components/Icon/IconUser';
import IconFacebook from '../../../components/Icon/IconFacebook';
import IconInstagram from '../../../components/Icon/IconInstagram';
import IconLinkedin from '../../../components/Icon/IconLinkedin';
import IconTwitter from '../../../components/Icon/IconTwitter';
import IconX from '../../../components/Icon/IconX';
import axios from 'axios';
import config from '../../../congif/config';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';
import { saveAs } from 'file-saver';
import _ from 'lodash';

const Booking = () => {
    const dispatch = useDispatch();
    const [defaultParams] = useState({
        booking_id: '',
        date: '',
        route_id: 0,
        client_id: 0,
        route_fare: 0,
        all_border_fare: 0,
        total_ammount: 0,
        ammount_to_driver: '',
        customer_id: 0,
        driver_id: 0,
    });
    const invoice = {
        penalty_ammount: '',
        driver_remark: '',
    };

    const [invoiceData, setInvoiceData] = useState(invoice);
    const [documentFile, setDocumentFile] = useState(null);
    const [consignment, setConsignment] = useState(null);
    const [driverDocumentFile, setDriverDocumentFile] = useState(null);
    const [userData, setUserData] = useState<any>([]);
    const [customerData, setCustomerData] = useState<any>([]);
    const [clientData, setClientData] = useState<any>([]);
    const [driverData, setDriverData] = useState<any>([]);
    const [routeData, setRouteData] = useState<any>([]);
    const [bookingsData, setBookingsData] = useState<any>([]);
    const [filterrouteData, setFilterrouteData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<any>(true);
    const [opened, { open, close }] = useDisclosure(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showDriverInfo, setShowDriverInfo] = useState(false);

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const [addContactModal, setAddContactModal] = useState<any>(false);
    const [viewContactModal, setViewContactModal] = useState<any>(false);
    const [currentDate, setCurrentDate] = useState(getFormattedDate());
    const [viewMode, setViewMode] = useState(false);
    const [modalOpened, setModalOpened] = useState(false);
    const [changeDate, setChangeDate] = useState(getFormattedDate());
    const [addInvoiceType, setAddInvoiceType] = useState(false);
    const [filteredBookingsData, setFilteredBookingsData] = useState<any>([]);

    const openModal = (contact: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (contact) {
            let json1 = JSON.parse(JSON.stringify(contact));
            setParams(json1);
        }

        // You can perform any necessary actions before opening the modal here
        setModalOpened(true);
    };

    const closeModal = () => {
        // You can perform any necessary actions before closing the modal here
        setModalOpened(false);
    };

    // Helper function to get the current date in "YYYY-MM-DD" format
    function getFormattedDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        params.date = today;
        return `${year}-${month}-${day}`;
    }

    const fetch = async () => {
        const responce = await axios.get(`${config.API_BASE_URL}/drivers`);
        console.log(responce?.data);

        const driver = await axios.get(`${config.API_BASE_URL}/drivers`);
        setDriverData(driver?.data);
        console.log('driverData.......', driverData, 'driverData', driver);

        const customer = await axios.get(`${config.API_BASE_URL}/customers`);
        setCustomerData(customer?.data?.data);
        console.log('CustomerData', customerData, 'cc', customer);

        const client = await axios.get(`${config.API_BASE_URL}/client`);
        setClientData(client?.data?.data);
        console.log('ClientData', clientData, 'clintdta', client);

        const routes = await axios.get(`${config.API_BASE_URL}/routes`);

        setRouteData(routes?.data?.routes);
        console.log('routes', routeData, 'routes', routes);

        setUserData(responce?.data);

        const bookings = await axios.get(`${config.API_BASE_URL}/bookings`);
        console.log(bookings?.data?.data, '\\\\\\\\');

        setBookingsData(bookings?.data?.data);
        setFilteredBookingsData(bookings?.data?.data); //
    };
    useEffect(() => {
        dispatch(setPageTitle('Contacts'));

        fetch();
    }, [addContactModal]);
    console.log(userData, 'userData');

    const [value, setValue] = useState<any>('list');

    const changeValue = (e: any) => {
        const { value, id, name } = e.target;
        setParams({ ...params, [name]: value });
    };
    const changeValueInvoice = (e: any) => {
        const { value, id, name } = e.target;
        setInvoiceData({ ...invoiceData, [name]: value });
    };

    const [search, setSearch] = useState<any>('');
    // static for now
    let [contactList] = useState<any>(userData);

    const [filteredItems, setFilteredItems] = useState<any>(userData);
    console.log(filteredItems, 'filteredItems', userData);

    useEffect(() => {
        setFilteredItems(() => {
            return userData.filter((item: any) => {
                return item.name.toLowerCase().includes(search.toLowerCase());
            });
        });
    }, [search, contactList, userData, params]);
    contactList = userData;

    const saveUser = async (e: any) => {
        e.preventDefault();

        try {
            if (params.booking_id && !addInvoiceType) {
                if (documentFile) {
                    const formData = new FormData();
                    formData.append('document', documentFile);
                    const update = await axios.put(`${config.API_BASE_URL}/bookings/${params.booking_id}`, formData);
                    console.log(update, 'Update successful');
                    showMessage(' updated successfully.');
                    setDocumentFile(null);
                    closeModal();
                    await fetch();
                } else {
                    const update = await axios.put(`${config.API_BASE_URL}/bookings/${params.booking_id}`, params);
                    showMessage('Booking has been updated successfully.');
                }
            } else if (params.booking_id && addInvoiceType) {
                if (consignment) {
                    // Merge params and invoiceData
                    const requestData = {
                        ...params,
                        ...invoiceData,
                    };

                    const formData = new FormData();

                    // Append key-value pairs from requestData to formData
                    Object.entries(requestData).forEach(([key, value]) => {
                        formData.append(key, value);
                    });

                    formData.append('consignment', consignment);

                    const invoiceResponse = await axios.post(`${config.API_BASE_URL}/invoice`, formData);
                    console.log(invoiceResponse, 'Invoice Add successful');
                    showMessage('Invoice Add successful');
                    setConsignment(null);
                    setInvoiceData(invoice)

                    closeModal();
                    await fetch();
                } else {
                    const update = await axios.put(`${config.API_BASE_URL}/bookings/${params.booking_id}`, params);
                    showMessage('Booking has been updated successfully.');
                }
            } else {
                const data = { ...params };
                const dataDriverIdAsNumber = parseInt(data.driver_id, 10);
                const matchedDriver = driverData.find((driver: any) => driver.driver_id === dataDriverIdAsNumber);
                // return console.log(matchedDriver, "zhsdgsahdga")
                if (matchedDriver) {
                    const todayDate = new Date();
                    const drivingLicenseExpiryDate = new Date(matchedDriver.drivingLicenseExpiryDate);
                    if (drivingLicenseExpiryDate < todayDate) {
                        matchedDriver.drivingLicenseExpiryDate = changeDate;
                        const updateDriver = await axios.put(`${config.API_BASE_URL}/drivers/${dataDriverIdAsNumber}`, matchedDriver);
                        console.log(updateDriver.data, 'Driver updated successfully');
                    }
                }

                data.new_booking_id = generateBookingNumber();
                // Add new booking (POST request)
                // return console.log(data,"datadtarta")
                if (driverDocumentFile) {
                    const formData = new FormData();
                    Object.entries(data).forEach(([key, value]) => {
                        formData.append(key, value);
                    });
                    formData.append('driverDocumentFile', driverDocumentFile);
                    const addBooking = await axios.post(`${config.API_BASE_URL}/bookings`, formData);
                    console.log(addBooking, 'Add successful');
                    showMessage('Booking has been saved successfully.');
                }
            }

            setAddContactModal(false);
        } catch (error) {
            // Handle error
            console.error('Error:', error);
        }
    };

    const editUser = async (user: any = null, type: any) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (user) {
            let json1 = JSON.parse(JSON.stringify(user));
            setParams(json1);
        }
        if (type === 'invoice') {
            setAddInvoiceType(true);
            setAddContactModal(true);
        } else {
            setViewContactModal(false);
            setViewMode(false);
            setAddInvoiceType(false);
            setAddContactModal(true);
        }
    };

    const deleteUser = async (user: any = null) => {
        const data = {
            booking_status: 'complete',
        };
        await axios.put(`${config.API_BASE_URL}/bookings/bookingstatus/${user.booking_id}`, data);

        await fetch();
        showMessage('Booking has been deleted successfully.');
    };

    const ViewUser = async (user: any = null) => {
        console.log(user, 'user');
        let json1 = JSON.parse(JSON.stringify(user));
        setParams(json1);
        setViewContactModal(true);
        setAddContactModal(true);
        setViewMode(true);
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    function generateBookingNumber() {
        const prefix = 'BOOK';
        const timestamp = new Date().getTime(); // Get the current timestamp
        const randomSuffix = Math.floor(Math.random() * 1000); // Generate a random number

        const bookingNumber = `${prefix}-${timestamp}-${randomSuffix}`;

        return bookingNumber;
    }

    const filterRoute = (route: any) => { };
    const addbooking = async (user: any = null) => {
        setAddContactModal(true);
        setParams(defaultParams);
        setViewMode(false);

        setAddInvoiceType(false)
    };

    const handleDocumentChange = (e: any) => {
        setDocumentFile(e.target.files[0]);
    };

    const handleinvoiceDocumentChange = (e: any) => {
        setConsignment(e.target.files[0]);
    };

    // Assuming contact.document_path contains the URL or path to the uploaded document
    // const documentUrl = `http://localhost:2000/uploads/${contact.document_path}`;
    // const handleViewDocument = (contact: any) => {
    //     // Assuming contact.document_path contains the URL or path to the uploaded document
    //     const documentUrl = `http://localhost:2000/uploads/${contact?.document_path}`;
    //     console.log(documentUrl, 'documentUrl');

    //     // Open a new window or tab with the document URL
    //     window.open(documentUrl, '_blank');
    // };

    const handleDownloadDocument = (contact: any) => {
        const documentUrl = `${config.API_DOC_URL}/uploads/${contact?.document_path}`;

        // Trigger the download using the saveAs function
        saveAs(documentUrl, 'Download');
    };
    const handleDriverDocument = (e: any) => {
        setDriverDocumentFile(e.target.files[0]);
    };

    useEffect(() => {
        setFilteredItems(() => {
            return bookingsData?.filter((item: any) => {
                return item?.name?.toLowerCase().includes(search?.toLowerCase());
            });
        });
    }, [search, contactList, userData]);

    const filterOnlyBooking = () => {
        const filteredData = bookingsData.filter((item) => item.booking_status === 'pending' && item.invoice_status === 'pending');
        setFilteredBookingsData(filteredData);
    };

    const filterOnlyInvoice = () => {
        const filteredData = bookingsData.filter((item) => item.invoice_status === 'generated');
        setFilteredBookingsData(filteredData);
    };

    const filterCancelledData = () => {
        const filteredData = bookingsData.filter((item) => item.booking_status === 'complete');
        setFilteredBookingsData(filteredData);
    };
    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl">Booking</h2>

                <div className="flex sm:flex-row flex-col sm:items-center gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div style={{ margin: '0', padding: '0' }}>
                            <Button className="btn btn-sm btn-outline-primary" onClick={filterOnlyBooking}>
                                Only Booking
                            </Button>
                        </div>
                        <div style={{ margin: '0', padding: '0' }}>
                            <Button className="btn btn-sm btn-outline-primary" onClick={filterOnlyInvoice}>
                                Only Invoice
                            </Button>
                        </div>
                        <div style={{ margin: '0', padding: '0' }}>
                            <Button className="btn btn-sm btn-outline-primary" onClick={filterCancelledData}>
                                Cancelled
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex sm:flex-row flex-col sm:items-center sm:gap-3 gap-4 w-full sm:w-auto">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => addbooking()}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Add Booking
                            </button>
                        </div>
                        <div>
                            <Button className="btn btn-primary" onClick={open}>
                                Filter
                            </Button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${value === 'list' && 'bg-primary text-white'}`} onClick={() => setValue('list')}>
                                <IconListCheck />
                            </button>
                        </div>
                        <div>
                            <button type="button" className={`btn btn-outline-primary p-2 ${value === 'grid' && 'bg-primary text-white'}`} onClick={() => setValue('grid')}>
                                <IconLayoutGrid />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Search Contacts" className="form-input py-2 ltr:pr-11 rtl:pl-11 peer" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="button" className="absolute ltr:right-[11px] rtl:left-[11px] top-1/2 -translate-y-1/2 peer-focus:text-primary">
                            <IconSearch className="mx-auto" />
                        </button>
                    </div>
                </div>
            </div>
            {value === 'list' && (
                <div className="mt-5 panel p-0 border-0 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Customer</th>
                                    <th>Booking Id</th>
                                    <th>Date</th>
                                    <th>Route Name</th>
                                    <th>Total Ammount</th>
                                    <th>Ammount paid To Driver</th>
                                    <th>Document Status</th>
                                    <th>Tracking Status</th>
                                    <th>Upload Documents</th>
                                    <th>Add Invoice</th>
                                    <th>Invoice Number</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookingsData?.map((contact: any) => {
                                    return (
                                        <tr key={contact.id}>
                                            <td className="whitespace-nowrap">{contact.booking_id}</td>
                                            <td className="whitespace-nowrap">{contact.customer.company_name}</td>
                                            <td className="whitespace-nowrap">{contact.new_booking_id}</td>
                                            <td className="whitespace-nowrap">{contact.date}</td>
                                            <td className="whitespace-nowrap">{contact.border_Route.route_name}</td>
                                            <td className="whitespace-nowrap">{contact.total_ammount}</td>
                                            <td className="whitespace-nowrap">{contact.ammount_to_driver}</td>
                                            {!contact || !contact.document_path || contact.document_path === '' || contact.document_path == null ? (
                                                <td className="whitespace-nowrap">Pending</td>
                                            ) : (
                                                <td className="whitespace-nowrap">Received</td>
                                            )}

                                            <td className="whitespace-nowrap">
                                                {contact.trackingsses && contact.trackingsses.length > 0 ? (
                                                    // Use lodash's get function to safely navigate nested properties
                                                    _.get(contact.trackingsses[0], 'tracking.tracking_stage', 'No tracking data available')
                                                ) : (
                                                    <span className="whitespace-nowrap">No tracking data available</span>
                                                )}
                                            </td>
                                            <td>
                                                {contact?.document_path == '' || contact.document_path === null || !contact?.document_path ? (
                                                    <div className="flex gap-4 items-center justify-center">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal(contact)}>
                                                            Upload Document
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-4 items-center justify-center">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleDownloadDocument(contact)}>
                                                            View Document
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {contact.invoice_status != 'generated' ? (
                                                    <div className="flex gap-4 items-center justify-center">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editUser(contact, 'invoice')}>
                                                            Add Invoice
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editUser(contact, 'invoice')}>
                                                        View Invoice
                                                    </button>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap">{contact.status}</td>
                                            <td>
                                                <div className="flex gap-4 items-center justify-center">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => ViewUser(contact)}>
                                                        view
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editUser(contact, 'edit')}>
                                                        Edit
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(contact)}>
                                                        {contact.booking_status === 'pending' ? 'Cancle' : ' Booking Canceled'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {value === 'grid' && (
                <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-5 w-full">
                    {filteredItems.map((contact: any) => {
                        return (
                            <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative" key={contact.id}>
                                <div className="bg-white dark:bg-[#1c232f] rounded-md overflow-hidden text-center shadow relative">
                                    <div
                                        className="bg-white/40 rounded-t-md bg-center bg-cover p-6 pb-0 bg-"
                                        style={{
                                            backgroundImage: `url('/assets/images/notification-bg.png')`,
                                            backgroundRepeat: 'no-repeat',
                                            width: '100%',
                                            height: '100%',
                                        }}
                                    >
                                        <img className="object-contain w-4/5 max-h-40 mx-auto" src={`/assets/images/${contact.path}`} alt="contact_image" />
                                    </div>
                                    <div className="px-6 pb-24 -mt-10 relative">
                                        <div className="shadow-md bg-white dark:bg-gray-900 rounded-md px-2 py-4">
                                            <div className="text-xl">{contact.name}</div>
                                            <div className="text-white-dark">{contact.role}</div>
                                            <div className="flex items-center justify-between flex-wrap mt-6 gap-3">
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.posts}</div>
                                                    <div>Posts</div>
                                                </div>
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.following}</div>
                                                    <div>Following</div>
                                                </div>
                                                <div className="flex-auto">
                                                    <div className="text-info">{contact.followers}</div>
                                                    <div>Followers</div>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <ul className="flex space-x-4 rtl:space-x-reverse items-center justify-center">
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconFacebook />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconInstagram />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconLinkedin />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" className="btn btn-outline-primary p-0 h-7 w-7 rounded-full">
                                                            <IconTwitter />
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="mt-6 grid grid-cols-1 gap-4 ltr:text-left rtl:text-right">
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Email :</div>
                                                <div className="truncate text-white-dark">{contact.email}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Phone :</div>
                                                <div className="text-white-dark">{contact.phone}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="flex-none ltr:mr-2 rtl:ml-2">Address :</div>
                                                <div className="text-white-dark">{contact.location}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex gap-4 absolute bottom-0 w-full ltr:left-0 rtl:right-0 p-6">
                                        {/* <button type="button" className="btn btn-outline-primary w-1/2" onClick={() => editUser(contact)}>
                                            Edit
                                        </button> */}
                                        {/* <button type="button" className="btn btn-outline-danger w-1/2" onClick={() => deleteUser(contact)}>
                                            Delete
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Transition appear show={addContactModal} as={Fragment}>
                <Dialog
                    as="div"
                    open={addContactModal}
                    onClose={() => {
                        setAddContactModal(false);
                        setAddInvoiceType(false);
                    }}
                    className="relative z-[51]"
                >
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center px-4 py-8">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddContactModal(false), setAddInvoiceType(false);
                                        }}
                                        className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {/* {params.booking_id ? 'Edit Contact' : 'Add Booking'} */}
                                        {viewContactModal
                                            ? 'Booking Details'
                                            : params.booking_id && !addInvoiceType
                                                ? 'Edit Booking'
                                                : params.booking_id && addInvoiceType
                                                    ? 'Add Invoice'
                                                    : 'Add Booking'}
                                    </div>
                                    <div className="p-5">
                                        <form onSubmit={(e) => saveUser(e)}>
                                            {/* <div> */}
                                            <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="routename">Booking Id</label>
                                                    <input
                                                        id="booking_id"
                                                        name="booking_id"
                                                        onChange={(e) => changeValue(e)}
                                                        value={params.booking_id || generateBookingNumber()}
                                                        type="text"
                                                        placeholder="Enter Booking Id"
                                                        className="form-input"
                                                        disabled={viewMode || params.booking_id}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="routename">Date</label>
                                                    <input
                                                        id=""
                                                        type="date"
                                                        onChange={(e) => setCurrentDate(e.target.value)}
                                                        value={currentDate}
                                                        name="date"
                                                        className="form-input"
                                                        disabled={viewMode}
                                                        required
                                                    />
                                                </div>
                                                {/* </div> */}
                                            </div>

                                            {
                                                <div className="mt-4">
                                                    <div>
                                                        <label htmlFor="routename">Select Customer</label>
                                                        <select
                                                            name="customer_id"
                                                            onChange={(e) => changeValue(e)}
                                                            className="form-select text-white-dark"
                                                            value={params.customer_id}
                                                            disabled={viewMode}
                                                            required
                                                        >
                                                            <option value={0}>Select Customer</option>
                                                            {customerData.map((customer: any) => (
                                                                <option key={customer.customer_id} value={parseInt(customer.customer_id)}>
                                                                    {customer.company_name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {params.customer_id != 0 ? (
                                                            <div className="flex">
                                                                <h1></h1>
                                                                {customerData.map((value: any) =>
                                                                    value.customer_id === parseInt(params.customer_id) ? (
                                                                        <div className="flex">
                                                                            <label className="ml-8 mt-2 font-bold text-blue-500">Balance: {value.balance}</label>
                                                                            <label className="ml-8 mt-2 font-bold text-green-500">Credit Limit: {value.credit_limit}</label>
                                                                            <label className="ml-8 mt-2 font-bold text-red-500">Credit Use: {0}</label>
                                                                        </div>
                                                                    ) : (
                                                                        ''
                                                                    )
                                                                )}
                                                            </div>
                                                        ) : (
                                                            ''
                                                        )}
                                                    </div>
                                                </div>
                                            }
                                            {/* <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 gap-4"> */}
                                            <div>
                                                <label htmlFor="">Client</label>
                                                <div>
                                                    <select
                                                        name="client_id"
                                                        onChange={(e) => changeValue(e)}
                                                        value={params.client_id}
                                                        // onClick={() => (params.client_id = client.client_id)}
                                                        className="form-select text-white-dark"
                                                        required
                                                        disabled={viewMode}
                                                    >
                                                        <option value="0">Select client</option>
                                                        {clientData.map((client: any) => (
                                                            <option key={client.client_id} value={parseInt(client.client_id)}>
                                                                {client.company_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {params.client_id != 0 ? (
                                                        <div>
                                                            {clientData.map((client: any) =>
                                                                client.client_id === parseInt(params.client_id) ? (
                                                                    <div className="flex">
                                                                        <label className="ml-8 mt-2 font-bold text-blue-500"> Name : {client.contact_person}</label>
                                                                        <label className="ml-8 mt-2 font-bold text-green-500">phone_number : {client.phone_number}</label>
                                                                        {/* <label className="mr-4 font-bold text-red-500">balance : {client.balance}</label> */}
                                                                    </div>
                                                                ) : (
                                                                    ''
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        ''
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label htmlFor="routename">Select Driver</label>
                                                {driverData && (
                                                    <div>
                                                        <div>
                                                            <select
                                                                name="driver_id"
                                                                onChange={(e) => changeValue(e)}
                                                                id="1"
                                                                className="form-select text-white-dark"
                                                                value={params.driver_id}
                                                                disabled={viewMode}
                                                                required
                                                            >
                                                                <option value={0}>select Drive</option>
                                                                {driverData.map((d: any) => (
                                                                    <option key={d.driver_id} value={d.driver_id}>
                                                                        {d.name}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            {driverData.map((d: any) =>
                                                                d.driver_id === parseInt(params.driver_id) ? (
                                                                    <div>
                                                                        <table className="table-auto">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td className="pr-4 font-bold text-blue-500">Driver Licence:</td>
                                                                                    <td
                                                                                        className={`pr-4 font-bold ${new Date(d.drivingLicenseExpiryDate) < new Date() ? 'text-red-500' : 'text-green-500'
                                                                                            }`}
                                                                                    >
                                                                                        {d.drivingLicenseNumber}
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td className="pr-4 font-bold text-blue-500">LIC EXPIRED AT:</td>
                                                                                    <td
                                                                                        className={`pr-4 font-bold ${new Date(d.drivingLicenseExpiryDate) < new Date() ? 'text-red-500' : 'text-green-500'
                                                                                            }`}
                                                                                    >
                                                                                        {new Date(d.drivingLicenseExpiryDate) < new Date() ? (
                                                                                            <input
                                                                                                id=""
                                                                                                type="date"
                                                                                                onChange={(e) => setChangeDate(e.target.value)}
                                                                                                value={changeDate}
                                                                                                name="expireDate"
                                                                                                className="form-input"
                                                                                                disabled={viewMode}
                                                                                                required
                                                                                                min={new Date().toISOString().split('T')[0]}
                                                                                            />
                                                                                        ) : (
                                                                                            new Date(d.drivingLicenseExpiryDate).toLocaleDateString('en-GB').split('/').join('-')
                                                                                        )}
                                                                                    </td>
                                                                                </tr>

                                                                                <tr>
                                                                                    <td className="pr-4 font-bold text-blue-500">Truck Type:</td>
                                                                                    <td
                                                                                        className={`pr-4 font-bold ${new Date(d.drivingLicenseExpiryDate) < new Date() ? 'text-red-500' : 'text-green-500'
                                                                                            }`}
                                                                                    >
                                                                                        {d.truckType}
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td className="pr-4 font-bold text-blue-500">Truck Number:</td>
                                                                                    <td
                                                                                        className={`pr-4 font-bold ${new Date(d.drivingLicenseExpiryDate) < new Date() ? 'text-red-500' : 'text-green-500'
                                                                                            }`}
                                                                                    >
                                                                                        {d.truckNumber}
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td className="pr-4 font-bold text-blue-500">Status:</td>
                                                                                    <td
                                                                                        className={`pr-4 font-bold ${new Date(d.drivingLicenseExpiryDate) < new Date() ? 'text-red-500' : 'text-green-500'
                                                                                            }`}
                                                                                    >
                                                                                        {d.status}
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ) : (
                                                                    ''
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4">
                                                <div>
                                                    <label htmlFor="">Select Route Name</label>
                                                    <select
                                                        name="route_id"
                                                        onChange={(e) => {
                                                            params.route_id = parseInt(e.target.value);
                                                            const selectedRouteData = routeData.find((route: any) => route.route_id === parseInt(params.route_id));
                                                            console.log(selectedRouteData, 'selected');
                                                            setFilterrouteData(selectedRouteData);
                                                            params.route_fare = selectedRouteData.totalFare;
                                                            const all_border_fare = Array.isArray(selectedRouteData.borders)
                                                                ? selectedRouteData.borders.reduce((acc: any, border: any) => acc + border.charges, 0)
                                                                : 0;
                                                            console.log(all_border_fare, 'all_border_fareall_border_fareall_border_fare');
                                                            params.all_border_fare = all_border_fare;
                                                        }}
                                                        id="ctnSelect1"
                                                        className="form-select text-white-dark"
                                                        required
                                                        disabled={viewMode}

                                                    // placeholder="Enter Country"
                                                    >
                                                        <option value={0}>Select Route Name</option>
                                                        {routeData.map((country: any) => (
                                                            <option key={country.route_id} value={country.route_id}>
                                                                {country.route_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {/* Table displaying selected route data */}

                                                {params.route_id != 0 && (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full table-auto">
                                                            <thead>
                                                                <tr>
                                                                    {/* Customize the table headers based on your data structure */}
                                                                    <th className="border p-4">Border Name</th>
                                                                    <th className="border p-4">border type</th>
                                                                    <th className="border p-4">border charges</th>
                                                                    {/* Add more headers as needed */}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {Array.isArray(filterrouteData.borders)
                                                                    ? filterrouteData.borders.map((i: any) => (
                                                                        <tr key={i.borderName}>
                                                                            {/* Display data corresponding to the selected route */}
                                                                            <td className="border p-4">{i.borderName}</td>
                                                                            <td className="border p-4">{i.type}</td>
                                                                            <td className="border p-4">{i.charges}</td>
                                                                            {/* Add more cells as needed */}
                                                                        </tr>
                                                                    ))
                                                                    : ''}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>

                                            {/* </div> */}

                                            <div className="mt-4">
                                                <label className="mb-2 inline-block text-neutral-700 dark:text-neutral-200" htmlFor="driver_documents">
                                                    Border Receipt
                                                </label>
                                                <input
                                                    id="driver_documents"
                                                    name="driver_documents"
                                                    onChange={handleDriverDocument}
                                                    type="file"
                                                    placeholder="Enter Truck Document"
                                                    className="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] font-normal leading-[2.15] text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                                                    required
                                                    disabled={viewMode}
                                                />
                                            </div>
                                            <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="routename">Route Fare</label>
                                                    <input
                                                        id="booking_id"
                                                        name="route_fare"
                                                        onChange={(e) => changeValue(e)}
                                                        value={params.route_fare}
                                                        type="number"
                                                        placeholder="Enter Route Fare"
                                                        className="form-input"
                                                        required
                                                        disabled={viewMode}
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="routename">Border Fare</label>
                                                    <input
                                                        id="border_fare"
                                                        name="all_border_fare"
                                                        onChange={(e) => changeValue(e)}
                                                        value={params.all_border_fare}
                                                        type="number"
                                                        // readOnly
                                                        placeholder="Enter All Border Fare"
                                                        className="form-input"
                                                        required
                                                        disabled={addInvoiceType ? viewMode : !viewMode}
                                                    />
                                                </div>
                                            </div>

                                            {/* <div className="mt-4">
                                                <label htmlFor="routename">Border Details</label>
                                                <input
                                                    id="border_fare"
                                                    name="border_datails"
                                                    onChange={(e) => changeValue(e)}
                                                    value={params.border_datails}
                                                    type="text"
                                                    placeholder="Enter Boder Details"
                                                    className="form-input"
                                                    required
                                                />
                                            </div> */}

                                            <div className="mt-4">
                                                <div>
                                                    <label htmlFor="routename">Ammount To Driver</label>
                                                    <input
                                                        id="ammount_to_driver"
                                                        onChange={(e) => changeValue(e)}
                                                        value={parseInt(params.ammount_to_driver)}
                                                        type="number"
                                                        name="ammount_to_driver"
                                                        placeholder="Enter Ammount To Driver"
                                                        className="form-input"
                                                        required
                                                        disabled={viewMode}
                                                    />
                                                </div>
                                            </div>

                                            {addInvoiceType ? (
                                                <>
                                                    <div className="mt-4">
                                                        <div>
                                                            <label htmlFor="routename">Drivers Remark</label>
                                                            <input
                                                                id="driver_remark"
                                                                onChange={(e) => changeValueInvoice(e)}
                                                                value={invoiceData.driver_remark}
                                                                type="text"
                                                                name="driver_remark"
                                                                placeholder="Enter Remark"
                                                                className="form-input"
                                                            // required
                                                            // disabled={viewMode}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <div>
                                                            <label htmlFor="routename">penalty Amount</label>
                                                            <input
                                                                id="penalty_ammount"
                                                                onChange={(e) => changeValueInvoice(e)}
                                                                value={invoiceData.penalty_ammount}
                                                                type="number"
                                                                name="penalty_ammount"
                                                                placeholder="Enter Penalty Amount"
                                                                className="form-input"
                                                            // required
                                                            // disabled={viewMode}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <div>
                                                            <div>
                                                                <label htmlFor="routename">Upload Consignment Document</label>
                                                                <input
                                                                    type="file"
                                                                    id="consignment"
                                                                    name="consignment"
                                                                    className="form-input"
                                                                    onChange={handleinvoiceDocumentChange}
                                                                    accept=".pdf, .doc, .docx"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                ''
                                            )}
                                            <div className="mt-4">
                                                <div>
                                                    <label htmlFor="routename">Total Ammount</label>
                                                    <input
                                                        id="total_ammount"
                                                        onChange={(e) => changeValue(e)}
                                                        value={
                                                            (params.total_ammount =
                                                                parseInt(params.route_fare) +
                                                                parseInt(params.all_border_fare) +
                                                                parseInt(params.ammount_to_driver) +
                                                                (invoiceData && parseInt(invoiceData.penalty_ammount) ? parseInt(invoiceData.penalty_ammount) : 0))
                                                        }
                                                        type="number"
                                                        name="total_ammount"
                                                        readOnly
                                                        placeholder="Enter Total Ammount"
                                                        className="form-input"
                                                        required
                                                        disabled={viewMode}
                                                    />
                                                </div>
                                            </div>
                                            {!viewContactModal && (
                                                <div className="flex justify-end items-center mt-8">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddContactModal(false)}>
                                                        Cancel
                                                    </button>
                                                    {/* <div className="flex gap-4 items-center justify-center">
                                                        <button
                                                            onClick={() => setIsOpen(!isOpen)}
                                                            className="bg-success ltr:ml-4 rtl:mr-4 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
                                                        >
                                                            view
                                                        </button>
                                                    </div> */}

                                                    {/* Pop-up Box */}
                                                    {isOpen && (
                                                        <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center">
                                                            <div className="bg-white p-8 rounded shadow-lg w-96">
                                                                <p>Details of Client</p>
                                                                <button
                                                                    onClick={() => setIsOpen(false)}
                                                                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring focus:border-red-300"
                                                                >
                                                                    Close
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                        {params?.booking_id && !addInvoiceType ? 'Edit Booking' : params.booking_id && addInvoiceType ? 'Add Invoice' : 'Add Booking'}
                                                    </button>
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* filter */}
            <Modal opened={opened} onClose={close} title="Filter">
                <form>
                    <div className="grid mt-4">
                        <div>
                            <label htmlFor="routename">Date</label>
                            <input id="date" type="date" name="date" onChange={(e) => changeValue(e)} value={params.date} placeholder="--/--/--" className="form-input" required />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div>
                            <select name="status" onChange={(e) => changeValue(e)} value={params.status} className="form-select text-white-dark" required>
                                <option value="">Unpaid</option>
                                <option value="origin">Paid</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end items-center w-100 mt-8">
                        <button type="button" className="btn btn-outline-success">
                            Filter
                        </button>
                    </div>
                </form>
            </Modal>
            <Modal opened={modalOpened} onClose={closeModal} title="Upload Document">
                <form onSubmit={(e) => saveUser(e)}>
                    <div>
                        <label htmlFor="document">Upload Document</label>
                        <input type="file" id="document" name="document" className="form-input" onChange={handleDocumentChange} accept=".pdf, .doc, .docx" required />
                    </div>

                    <div className="flex justify-end items-center w-100 mt-8">
                        <button type="submit" className="btn btn-outline-success">
                            Upload
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Booking;
