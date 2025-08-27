import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, onSnapshot, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import {
  User as UserIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Home as HomeIcon,
  List as ListIcon,
  FileText as FileTextIcon,
  Ticket as TicketIcon,
  UserCheck as UserCheckIcon,
  Clock as ClockIcon,
  RefreshCcw as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Trash as TrashIcon,
  ChevronRight as ChevronRightIcon,
  LogOut as LogOutIcon,
  ClipboardCheck as ClipboardCheckIcon,
  Users as UsersIcon,
  Grid as GridIcon,
  DollarSign as DollarSignIcon,
  Settings as SettingsIcon,
  Briefcase as BriefcaseIcon,
  Zap as LightningIcon, // Using Zap for the lightning icon
} from 'lucide-react';

// --- Firebase Initialization and Globals ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase App
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

// --- Service Price Data ---
const priceList = {
  'Ceiling Fan': 200, 'Gas Stove': 250, 'Geyser': 250, 'AC': 350,
  'Cooler': 300, 'Washing Machine': 320, 'Iron': 180, 'Mixer Machine': 190,
  'Microwave': 350, 'Heater': 160, 'Fridge': 340, 'Bike': 600, 'Car': 1000
};

// The main App component that handles routing and state
export default function App() {
  const [panel, setPanel] = useState('home'); // Default to 'home' panel
  const [user, setUser] = useState(null); // Firebase user object
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Hardcoded for demo purposes with new credentials.
  const dummyUsers = [
    { id: 'admin1', username: 'luckyrounak', password: '@Vishu', role: 'admin' },
    { id: 'elec1', username: 'elec1', password: 'password', role: 'electrician' },
    { id: 'elec2', username: 'elec2', password: 'password', role: 'electrician' },
  ];

  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth is not initialized.');
      return;
    }

    const signInUser = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Error signing in with Firebase:", error);
      }
    };

    signInUser();

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [auth, initialAuthToken]);

  const handleLogin = (username, password) => {
    const foundUser = dummyUsers.find(u => u.username === username && u.password === password);
    if (foundUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
      setPanel(foundUser.role === 'admin' ? 'admin' : 'electrician');
      setShowLogin(false);
    } else {
      alert('Invalid username or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setPanel('home');
  };

  // Render different panels based on state
  const renderPanel = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser?.role === 'admin') {
      return <AdminPanel db={db} auth={auth} dummyElectricians={dummyUsers.filter(u => u.role === 'electrician')} onLogout={handleLogout} />;
    } else if (loggedInUser?.role === 'electrician') {
      return <ElectricianPanel db={db} auth={auth} electricianId={loggedInUser.id} onLogout={handleLogout} />;
    }

    switch (panel) {
      case 'home':
        return <HomePanel priceList={priceList} />;
      case 'pricing':
        return <PricingPanel priceList={priceList} />;
      case 'register':
        return <RegisterComplaintPanel db={db} auth={auth} priceList={priceList} />;
      case 'track':
        return <TrackComplaintPanel db={db} auth={auth} />;
      case 'about':
        return <AboutPanel />;
      default:
        return <HomePanel priceList={priceList} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-200 font-inter text-gray-800 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto p-4">
          {/* Top-right service details */}
          <div className="flex justify-end items-center space-x-4 text-xs font-medium text-blue-300">
            <div className="flex items-center space-x-1">
              <MapPinIcon size={16} className="text-blue-200" />
              <span>Muzaffarpur Only</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon size={16} className="text-blue-200" />
              <span>24/7 Service</span>
            </div>
          </div>
          {/* Main nav row */}
          <div className="flex flex-wrap items-center justify-between mt-4">
            {/* Logo and Name */}
            <div className="flex items-center space-x-2">
              <LightningIcon size={28} className="text-yellow-400" />
              <div>
                <h1 className="text-xl font-extrabold">DesiVolt</h1>
                <p className="text-xs text-blue-300">Electrical Service Provider</p>
              </div>
            </div>
            
            {/* Nav Links and Login */}
            <div className="flex items-center space-x-6 text-sm font-semibold text-white">
              <NavButton label="Home" active={panel === 'home'} onClick={() => setPanel('home')} />
              <NavButton label="About" active={panel === 'about'} onClick={() => setPanel('about')} />
              <NavButton label="Pricing" active={panel === 'pricing'} onClick={() => setPanel('pricing')} />
              <NavButton label="Register Complaint" active={panel === 'register'} onClick={() => setPanel('register')} />
              <NavButton label="Track Complaint" active={panel === 'track'} onClick={() => setPanel('track')} />
              {localStorage.getItem('loggedInUser') ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full transition duration-300 shadow-md"
                >
                  <LogOutIcon size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              ) : (
                <NavButton label="Login" active={showLogin} onClick={() => setShowLogin(true)} />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {panel === 'home' && (
        <div className="relative text-white flex flex-col items-center justify-center p-8 text-center bg-blue-600" style={{ height: '50vh' }}>
          <div className="absolute inset-0 bg-blue-800 opacity-80 z-0"></div>
          <div className="relative z-10 flex flex-col items-center">
            <LightningIcon size={56} className="text-yellow-400 mb-4" />
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Professional Electrical Services in Muzaffarpur</h1>
            <p className="mt-4 text-lg md:text-xl font-medium">Premium quality service for out-of-warranty appliances</p>
            <div className="flex items-center space-x-8 mt-8 text-sm font-semibold">
              <span className="flex items-center space-x-2"><MapPinIcon size={20} /><span>Serving Muzaffarpur Only</span></span>
              <span className="flex items-center space-x-2"><ClockIcon size={20} /><span>24/7 Service Available</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          {renderPanel()}
        </div>
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white p-8 rounded-xl shadow-xl w-11/12 md:w-96">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
            <h3 className="text-lg font-bold mb-4 text-blue-700 text-center">Admin/Electrician Login</h3>
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h4 className="text-xl font-bold mb-2 flex items-center justify-center md:justify-start">
                <LightningIcon size={20} className="mr-2 text-yellow-400"/>DesiVolt
              </h4>
              <p className="text-sm text-gray-300">Your trusted electrical service partner in Muzaffarpur.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Services</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>Out-of-Warranty Repairs</li>
                <li>Local Appliance Servicing</li>
                <li>24-Hour Problem Resolution</li>
                <li>Premium Quality Service</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Contact Us</h4>
              <p className="text-sm text-gray-300">
                Email: info@desivolt.com<br/>
                Phone: +91 98765 43210<br/>
                Address: Muzaffarpur, Bihar
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center">
            <p className="text-sm text-gray-400">&copy; 2024 DesiVolt. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Helper Components for Navigation ---
const NavButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      py-2 px-3 rounded-md transition-colors font-medium
      ${active ? 'text-white border-b-2 border-white' : 'text-blue-200 hover:bg-blue-700'}
    `}
  >
    {label}
  </button>
);

// --- Customer Panel Components (Refactored) ---
const RegisterComplaintPanel = ({ db, auth, priceList }) => {
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', landmark: '', pincode: '',
    applianceType: '', problemDescription: '',
  });
  const [message, setMessage] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!db || !auth) {
      setMessage('Database not available. Please try again later.');
      return;
    }

    try {
      const newTicketId = `MUZ-${Math.floor(1000 + Math.random() * 9000)}`;
      const complaintRef = collection(db, `artifacts/${appId}/public/data/complaints`);
      await addDoc(complaintRef, {
        ...formData,
        ticketId: newTicketId,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        assignedTo: null,
      });
      setTicketNumber(newTicketId);
      setShowModal(true);
      setFormData({
        name: '', phone: '', address: '', landmark: '', pincode: '',
        applianceType: '', problemDescription: '',
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage('Failed to submit complaint. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center"><BriefcaseIcon className="mr-2"/> Lodge a New Complaint</h3>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="input-field" placeholder="Full Name" />
        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="input-field" placeholder="Phone Number" />
        <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="input-field" placeholder="Address" />
        <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange} className="input-field" placeholder="Nearby Landmark (Optional)" />
        <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required className="input-field" placeholder="Pincode" />
        <select name="applianceType" value={formData.applianceType} onChange={handleInputChange} required className="input-field">
          <option value="">Select Appliance</option>
          {Object.keys(priceList).map(appliance => (
            <option key={appliance} value={appliance}>{appliance}</option>
          ))}
        </select>
        <textarea name="problemDescription" value={formData.problemDescription} onChange={handleInputChange} required rows="3" className="input-field" placeholder="Describe the problem in detail..."></textarea>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105">
          Submit Complaint
        </button>
      </form>
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
            <h4 className="text-lg font-bold text-green-600 mb-2">Complaint Submitted!</h4>
            <p className="text-gray-700 mb-4">Your ticket number is:</p>
            <p className="text-2xl font-extrabold text-blue-700">{ticketNumber}</p>
            <button onClick={() => setShowModal(false)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

const TrackComplaintPanel = ({ db, auth }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [complaintStatus, setComplaintStatus] = useState(null);
  const [message, setMessage] = useState('');

  const handleTrackComplaint = async () => {
    if (!db || !trackingNumber) {
      setMessage('Please enter a ticket number to track.');
      setComplaintStatus(null);
      return;
    }
    const complaintQuery = collection(db, `artifacts/${appId}/public/data/complaints`);
    try {
      const q = await getDocs(complaintQuery);
      let foundComplaint = null;
      q.forEach(doc => {
        if (doc.data().ticketId.toUpperCase() === trackingNumber.toUpperCase()) {
          foundComplaint = doc.data();
        }
      });
      setComplaintStatus(foundComplaint);
      if (!foundComplaint) {
        setMessage('Ticket number not found.');
      } else {
        setMessage('');
      }
    } catch (error) {
      console.error("Error fetching complaint:", error);
      setMessage('Error tracking complaint. Please try again.');
    }
  };

  useEffect(() => {
    if (db && trackingNumber) {
      const q = collection(db, `artifacts/${appId}/public/data/complaints`);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let foundComplaint = null;
        snapshot.forEach(doc => {
          if (doc.data().ticketId.toUpperCase() === trackingNumber.toUpperCase()) {
            foundComplaint = { id: doc.id, ...doc.data() };
          }
        });
        setComplaintStatus(foundComplaint);
        if (!foundComplaint) {
          setMessage('Ticket number not found.');
        } else {
          setMessage('');
        }
      }, (error) => {
        console.error("Error getting real-time updates:", error);
      });
      return () => unsubscribe();
    }
  }, [db, trackingNumber]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200">
      <h3 className="text-2xl font-bold mb-4 text-center text-green-600 flex items-center justify-center"><TicketIcon className="mr-2"/> Track Your Complaint</h3>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
          placeholder="Enter Ticket Number (e.g., MUZ-1234)"
          className="input-field flex-grow"
        />
        <button
          onClick={handleTrackComplaint}
          className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
        >
          Track Status
        </button>
      </div>
      
      {message && <p className={`text-center mb-4 font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
      
      {complaintStatus && (
        <div className="bg-gray-100 p-6 rounded-xl shadow-inner border border-gray-300 space-y-3">
          <h4 className="text-lg font-bold text-gray-800 flex items-center"><ClipboardCheckIcon className="mr-2" /> Ticket Status: <span className={`ml-2 text-xl font-extrabold ${
              complaintStatus.status === 'Resolved' ? 'text-green-600' :
              complaintStatus.status === 'In Progress' ? 'text-yellow-600' :
              'text-red-600'
            }`}>{complaintStatus.status}</span></h4>
          <p className="font-semibold text-gray-600">Appliance: <span className="font-normal text-gray-900">{complaintStatus.applianceType}</span></p>
          <p className="font-semibold text-gray-600">Description: <span className="font-normal text-gray-900">{complaintStatus.problemDescription}</span></p>
          <p className="font-semibold text-gray-600">Assigned To: <span className="font-normal text-gray-900">{complaintStatus.assignedTo || 'Not yet assigned'}</span></p>
        </div>
      )}
    </div>
  );
};

const PricingPanel = ({ priceList }) => (
  <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-200">
    <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-center text-blue-700">Service Price List</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.keys(priceList).map(appliance => (
        <div key={appliance} className="flex flex-col items-center p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-300">
          <SettingsIcon size={36} className="text-blue-500 mb-2" />
          <h4 className="text-lg font-bold text-gray-800">{appliance}</h4>
          <p className="text-3xl font-extrabold text-green-600 mt-2">₹{priceList[appliance]}</p>
        </div>
      ))}
    </div>
    <p className="mt-8 text-center font-semibold text-gray-600">
      <span className="text-red-500">*</span> Note: Spare parts cost extra.
    </p>
  </div>
);

const HomePanel = () => (
  <div className="p-8 text-center">
    <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-4">About DesiVolt</h2>
    <p className="text-gray-600 max-w-2xl mx-auto">
      DesiVolt is a premium electrical service provider located exclusively in Muzaffarpur. We specialize in out-of-warranty and local appliance repairs, offering professional, company-quality service right to your doorstep. Our guarantee is to solve your problem within 24 hours. If we fail to do so, you only pay 50% of the service charge.
    </p>
  </div>
);

const AboutPanel = () => (
  <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl border border-gray-200">
    <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-center text-blue-700">About Us</h2>
    <div className="prose lg:prose-lg max-w-none">
      <p>
        DesiVolt was founded to address the need for reliable, high-quality electrical repair services in Muzaffarpur. We noticed a gap in the market for services that combine the professionalism of a brand's service center with the convenience of a local provider. Our mission is simple: to provide swift, guaranteed repairs for your everyday electrical appliances.
      </p>
      <p>
        Our team of certified electricians is trained to handle a wide range of issues for out-of-warranty appliances like ceiling fans, gas stoves, coolers, and more. We believe in transparency, which is why our service charges are clearly listed, with separate costs for any spare parts needed. Our commitment to you is to provide an efficient and trustworthy service experience every time.
      </p>
      <p className='mt-8'>
        **Founder:** Vishal Kumar<br/>
        **Co-Founder:** Gaurav Kumar
      </p>
    </div>
  </div>
);

// --- Admin Panel Component ---
const AdminPanel = ({ db, auth, dummyElectricians, onLogout }) => {
  const [complaints, setComplaints] = useState([]);
  const [electricians, setElectricians] = useState([]);
  const [selectedElectricianId, setSelectedElectricianId] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [complaintToDelete, setComplaintToDelete] = useState(null);

  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === 'Pending').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

  useEffect(() => {
    if (!db || !auth || !auth.currentUser) return;
    const complaintsRef = collection(db, `artifacts/${appId}/public/data/complaints`);
    const unsubscribeComplaints = onSnapshot(complaintsRef, (snapshot) => {
      const allComplaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(allComplaints);
    });

    setElectricians(dummyElectricians.map(e => ({ id: e.id, username: e.username })));

    return () => {
      unsubscribeComplaints();
    };
  }, [db, auth, dummyElectricians]);

  const handleAssign = async (complaintId) => {
    if (!db) return;
    if (!selectedElectricianId) {
      alert('Please select an electrician.');
      return;
    }

    try {
      const complaintRef = doc(db, `artifacts/${appId}/public/data/complaints`, complaintId);
      const electrician = electricians.find(e => e.id === selectedElectricianId);
      await updateDoc(complaintRef, {
        assignedTo: electrician.username,
        status: 'In Progress'
      });
      alert('Complaint assigned successfully!');
    } catch (error) {
      console.error("Error assigning complaint: ", error);
      alert('Failed to assign complaint.');
    }
  };

  const handleDelete = async () => {
    if (!db || !complaintToDelete || !deleteReason) {
      alert('Please provide a reason for deletion.');
      return;
    }

    try {
      const complaintRef = doc(db, `artifacts/${appId}/public/data/complaints`, complaintToDelete.id);
      await updateDoc(complaintRef, {
        status: 'Deleted',
        deletedReason: deleteReason,
      });
      setShowDeleteModal(false);
      setDeleteReason('');
      setComplaintToDelete(null);
      alert('Complaint deleted successfully!');
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert('Failed to delete complaint.');
    }
  };

  const getElectricianPerformance = () => {
    const performance = {};
    electricians.forEach(elec => {
      const assigned = complaints.filter(c => c.assignedTo === elec.username).length;
      const solved = complaints.filter(c => c.assignedTo === elec.username && c.status === 'Resolved').length;
      const pending = complaints.filter(c => c.assignedTo === elec.username && (c.status === 'Pending' || c.status === 'In Progress')).length;
      performance[elec.username] = { assigned, solved, pending };
    });
    return performance;
  };

  const performanceData = getElectricianPerformance();

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-700">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Complaints" count={totalComplaints} icon={<GridIcon className="text-blue-500" />} color="blue" />
        <StatCard title="Pending" count={pendingComplaints} icon={<ClockIcon className="text-yellow-500" />} color="yellow" />
        <StatCard title="In Progress" count={inProgressComplaints} icon={<RefreshIcon className="text-indigo-500" />} color="indigo" />
        <StatCard title="Resolved" count={resolvedComplaints} icon={<CheckCircleIcon className="text-green-500" />} color="green" />
      </div>

      <div className="overflow-x-auto bg-gray-50 rounded-xl shadow-inner p-4 mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center"><FileTextIcon className="mr-2"/> All Complaints</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appliance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {complaints.map(complaint => (
              <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{complaint.ticketId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{complaint.name}</div>
                  <div className="text-xs text-gray-500">{complaint.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{complaint.applianceType}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    complaint.status === 'Deleted' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{complaint.assignedTo || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {complaint.status !== 'Resolved' && complaint.status !== 'Deleted' ? (
                    <div className="flex items-center space-x-2">
                      <select
                        onChange={(e) => setSelectedElectricianId(e.target.value)}
                        className="p-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Assign To...</option>
                        {electricians.map(e => (
                          <option key={e.id} value={e.id}>{e.username}</option>
                        ))}
                      </select>
                      <button onClick={() => handleAssign(complaint.id)} className="text-indigo-600 hover:text-indigo-900 transition-colors">Assign</button>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Action not needed</span>
                  )}
                  <button
                    onClick={() => { setComplaintToDelete(complaint); setShowDeleteModal(true); }}
                    className="text-red-600 hover:text-red-900 transition-colors ml-4"
                  >
                    <TrashIcon size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto bg-gray-50 rounded-xl shadow-inner p-4">
        <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center"><UsersIcon className="mr-2"/> Electrician Performance</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Electrician</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.keys(performanceData).map(elecName => (
              <tr key={elecName} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{elecName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{performanceData[elecName].assigned}</td>
                <td className="px-6 py-4 whitespace-nowrap">{performanceData[elecName].solved}</td>
                <td className="px-6 py-4 whitespace-nowrap">{performanceData[elecName].pending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white p-8 rounded-xl shadow-xl w-11/12 md:w-96">
            <h3 className="text-lg font-bold mb-4 text-red-600">Confirm Deletion</h3>
            <p className="mb-4 text-gray-700">Are you sure you want to delete this complaint? Please provide a reason.</p>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Reason for deletion..."
              rows="3"
              className="input-field w-full mb-4"
            ></textarea>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteReason(''); }}
                className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Electrician Panel Component ---
const ElectricianPanel = ({ db, auth, electricianId, onLogout }) => {
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const electrician = JSON.parse(localStorage.getItem('loggedInUser'));

  useEffect(() => {
    if (!db || !auth || !auth.currentUser || !electrician?.username) return;
    const complaintsRef = collection(db, `artifacts/${appId}/public/data/complaints`);
    const unsubscribe = onSnapshot(complaintsRef, (snapshot) => {
      const assigned = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.assignedTo === electrician.username);
      setAssignedComplaints(assigned);
    }, (error) => {
      console.error("Error fetching electrician complaints:", error);
    });

    return () => unsubscribe();
  }, [db, auth, electrician]);

  const handleStatusUpdate = async (complaintId, newStatus) => {
    if (!db) return;
    try {
      const complaintRef = doc(db, `artifacts/${appId}/public/data/complaints`, complaintId);
      const updateData = { status: newStatus };
      if (newStatus === 'Resolved') {
        updateData.resolvedAt = new Date().toISOString();
      }
      await updateDoc(complaintRef, updateData);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-700">Electrician Dashboard</h2>
      <p className="text-center text-gray-600 mb-6">Welcome, <span className="font-semibold">{electrician?.username}</span>!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedComplaints.length === 0 ? (
          <p className="md:col-span-3 text-center text-gray-500 text-lg py-12">No complaints currently assigned to you. Enjoy the break! ✨</p>
        ) : (
          assignedComplaints.map(complaint => (
            <div key={complaint.id} className="bg-gray-100 p-6 rounded-xl shadow-md border border-gray-300 transition-transform hover:scale-105 duration-300">
              <h3 className="text-lg font-bold text-blue-700 flex items-center mb-2"><TicketIcon size={20} className="mr-2"/> Ticket: {complaint.ticketId}</h3>
              <p className="text-gray-600 font-medium">Customer: <span className="font-normal text-gray-900">{complaint.name} ({complaint.phone})</span></p>
              <p className="text-gray-600 font-medium">Appliance: <span className="font-normal text-gray-900">{complaint.applianceType}</span></p>
              <p className="text-gray-600 font-medium">Status: <span className={`font-semibold ${
                complaint.status === 'Resolved' ? 'text-green-600' :
                complaint.status === 'In Progress' ? 'text-yellow-600' :
                'text-red-600'
              }`}>{complaint.status}</span></p>
              <p className="text-gray-600 font-medium">Address: <span className="font-normal text-gray-900">{complaint.address}, {complaint.pincode}</span></p>
              <p className="text-gray-600 font-medium mb-4">Problem: <span className="font-normal text-gray-900">{complaint.problemDescription}</span></p>
              
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => handleStatusUpdate(complaint.id, 'In Progress')}
                  className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition-colors"
                  disabled={complaint.status === 'Resolved'}
                >
                  <RefreshIcon size={16} className="inline-block mr-1" />
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusUpdate(complaint.id, 'Resolved')}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
                  disabled={complaint.status === 'Resolved'}
                >
                  <CheckCircleIcon size={16} className="inline-block mr-1" />
                  Mark Resolved
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Helper Components ---
const StatCard = ({ title, count, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-100 border-blue-300 text-blue-700',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    indigo: 'bg-indigo-100 border-indigo-300 text-indigo-700',
    green: 'bg-green-100 border-green-300 text-green-700',
  };
  return (
    <div className={`flex items-center p-4 rounded-xl shadow-inner border ${colorMap[color]}`}>
      <div className="p-3 bg-white rounded-full mr-4 shadow-md">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-bold">{title}</h4>
        <p className="text-3xl font-extrabold">{count}</p>
      </div>
    </div>
  );
};

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input-field text-sm w-full sm:w-auto"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-field text-sm w-full sm:w-auto"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors"
      >
        Login
      </button>
    </form>
  );
};

// Global styling for input fields
// Using a separate style block for clarity
const inputStyle = `
  .input-field {
    @apply w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300;
  }
`;
