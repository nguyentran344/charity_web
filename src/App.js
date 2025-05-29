import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth } from "./firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateProjectForm from "./components/CreateProjectForm";
import ProjectDetail from "./pages/ProjectDetail";
import "./App.css";

const contractAddress = "0x0E4d13e6D59aAC88F9DedC34e3Fb441362CBC431"; // Thay bằng địa chỉ hợp đồng thực tế nếu cần
const contractABI = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_category", type: "string" },
    ],
    name: "createProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_projectId", type: "uint256" },
      { internalType: "string", name: "_message", type: "string" },
      { internalType: "bool", name: "_isAnonymous", type: "bool" },
      { internalType: "string", name: "_donorName", type: "string" },
    ],
    name: "donate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "donor",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "projectId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalDonated",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isAnonymous",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "string",
        name: "donorName",
        type: "string",
      },
    ],
    name: "Donated",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "_projectId", type: "uint256" }],
    name: "endProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address",
      },
    ],
    name: "ProjectCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "id", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address",
      },
    ],
    name: "ProjectEnded",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "_projectId", type: "uint256" }],
    name: "getProject",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "string", name: "category", type: "string" },
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "uint256", name: "totalDonated", type: "uint256" },
          { internalType: "bool", name: "active", type: "bool" },
          { internalType: "address[]", name: "donors", type: "address[]" },
        ],
        internalType: "struct CharityDonation.Project",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_projectId", type: "uint256" }],
    name: "getProjectDonations",
    outputs: [
      {
        components: [
          { internalType: "address", name: "donor", type: "address" },
          { internalType: "string", name: "message", type: "string" },
          { internalType: "bool", name: "isAnonymous", type: "bool" },
          { internalType: "string", name: "donorName", type: "string" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct CharityDonation.Donation[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "projectCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // (Các phương thức khác nếu có)
];

const App = () => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [category, setCategory] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initializeContract = async () => {
      if (!window.ethereum) {
        setError("Vui lòng cài đặt MetaMask");
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = `0x${network.chainId.toString(16)}`;
        console.log("Current chainId:", chainId);
        const expectedChainId = "0xaa36a7";
        if (chainId !== expectedChainId) {
          setError("Vui lòng chuyển sang mạng Sepolia");
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: expectedChainId }],
            });
          } catch (switchError) {
            console.error("Network switch error:", switchError);
            return;
          }
        }
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );
        console.log("Contract instance:", contractInstance); // Debug
        if (!contractInstance.projectCount) {
          console.error("projectCount method not found in contract");
          setError("Phương thức projectCount không tồn tại trong hợp đồng");
          return;
        }
        setContract(contractInstance);

        const projectCount = await contractInstance.projectCount();
        console.log("Project count:", Number(projectCount));
        const projectsArray = [];
        for (let i = 1; i <= Number(projectCount); i++) {
          try {
            const project = await contractInstance.getProject(i);
            projectsArray.push({
              id: Number(project.id),
              name: project.name,
              description: project.description,
              category: project.category,
              imageUrl: "",
              creator: project.creator,
              totalDonated: ethers.formatEther(project.totalDonated),
              active: project.active,
              donors: project.donors || [],
            });
          } catch (err) {
            console.error(`Error fetching project ${i}:`, err);
          }
        }
        setProjects(projectsArray);
      } catch (err) {
        console.error("Error initializing contract:", err);
        setError("Lỗi khi khởi tạo hợp đồng: " + (err.reason || err.message));
      }
    };

    initializeContract();
    auth.onAuthStateChanged((user) => setUser(user || null));
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("Vui lòng cài đặt MetaMask");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = `0x${network.chainId.toString(16)}`;
      console.log("Connect wallet chainId:", chainId);
      const expectedChainId = "0xaa36a7";
      if (chainId !== expectedChainId) {
        setError("Vui lòng chuyển sang mạng Sepolia");
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: expectedChainId }],
          });
        } catch (switchError) {
          console.error("Network switch error:", switchError);
          return;
        }
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      setWalletConnected(true);
      const signer = await provider.getSigner();
      const contractWithSigner = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contractWithSigner);
      setError("");
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Không thể kết nối ví MetaMask: " + (err.reason || err.message));
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email và mật khẩu không được để trống");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("Lỗi đăng nhập: " + err.message);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      setError("Email và mật khẩu không được để trống");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("Lỗi đăng ký: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setError("");
    } catch (err) {
      setError("Lỗi đăng xuất: " + err.message);
    }
  };

  const handleCreateProject = async (name, description, imageUrl, category) => {
    if (!walletConnected) {
      setError("Vui lòng kết nối ví MetaMask");
      return;
    }
    if (!name.trim() || !description.trim() || !imageUrl || !category) {
      setError("Tên dự án, mô tả, ảnh và danh mục không được để trống");
      return;
    }
    setLoading(true);
    try {
      const contractWithSigner = contract.connect(
        await new ethers.BrowserProvider(window.ethereum).getSigner()
      );
      const tx = await contractWithSigner.createProject(
        name,
        description,
        category
      );
      await tx.wait();
      setError("");
      alert("Tạo dự án thành công!");
      const projectCount = await contract.projectCount(); // Sử dụng contract đã kết nối
      const project = await contract.getProject(projectCount);
      setProjects([
        ...projects,
        {
          id: Number(project.id),
          name: project.name,
          description: project.description,
          category: project.category,
          imageUrl: imageUrl,
          creator: project.creator,
          totalDonated: ethers.formatEther(project.totalDonated),
          active: project.active,
          donors: project.donors || [],
        },
      ]);
      setProjectName("");
      setProjectDescription("");
      setCategory("");
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Lỗi tạo dự án: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (
    projectId,
    amount,
    message,
    isAnonymous,
    donorName
  ) => {
    if (!walletConnected) {
      setError("Vui lòng kết nối ví MetaMask");
      return;
    }
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError("Số tiền quyên góp phải là số dương");
      return;
    }
    if (message.length > 200) {
      setError("Lời nhắn không được quá 200 ký tự");
      return;
    }
    if (!isAnonymous && !donorName.trim()) {
      setError("Vui lòng nhập tên nếu chọn công khai");
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project || !project.active) {
      setError("Dự án không tồn tại hoặc đã kết thúc");
      return;
    }
    setLoading(true);
    try {
      const contractWithSigner = contract.connect(
        await new ethers.BrowserProvider(window.ethereum).getSigner()
      );
      const tx = await contractWithSigner.donate(
        projectId,
        message,
        isAnonymous,
        donorName,
        {
          value: ethers.parseEther(donationAmount.toString()),
        }
      );
      await tx.wait();
      setError("");
      alert("Quyên góp thành công!");
      const updatedProject = await contract.getProject(projectId);
      setProjects(
        projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                totalDonated: ethers.formatEther(updatedProject.totalDonated),
                donors: updatedProject.donors || p.donors,
              }
            : p
        )
      );
    } catch (err) {
      setError("Lỗi quyên góp: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEndProject = async (projectId) => {
    if (!walletConnected) {
      setError("Vui lòng kết nối ví MetaMask");
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project || !project.active) {
      setError("Dự án không tồn tại hoặc đã kết thúc");
      return;
    }
    setLoading(true);
    try {
      const contractWithSigner = contract.connect(
        await new ethers.BrowserProvider(window.ethereum).getSigner()
      );
      const tx = await contractWithSigner.endProject(projectId);
      await tx.wait();
      setError("");
      alert("Kết thúc dự án thành công!");
      setProjects(
        projects.map((p) => (p.id === projectId ? { ...p, active: false } : p))
      );
    } catch (err) {
      setError("Lỗi kết thúc dự án: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar
          user={user}
          handleLogout={handleLogout}
          connectWallet={connectWallet}
          walletConnected={walletConnected}
        />
        <div className="container mx-auto p-4">
          {error && <p className="text-red-500">{error}</p>}
          {loading && <p className="text-blue-500">Đang xử lý...</p>}
          {!contract && (
            <p className="text-yellow-500">
              Đang khởi tạo hợp đồng thông minh...
            </p>
          )}
          <Routes>
            <Route path="/" element={<Home projects={projects} />} />
            <Route
              path="/project/:id"
              element={
                <ProjectDetail
                  projects={projects}
                  handleDonate={handleDonate}
                  handleEndProject={handleEndProject}
                  user={user}
                  currentAccount={currentAccount}
                  walletConnected={walletConnected}
                  contract={contract}
                />
              }
            />
            <Route
              path="/login"
              element={
                <Login
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  handleLogin={handleLogin}
                  error={error}
                />
              }
            />
            <Route
              path="/register"
              element={
                <Register
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  handleRegister={handleRegister}
                  error={error}
                />
              }
            />
            <Route
              path="/create-project"
              element={
                <CreateProjectForm
                  projectName={projectName}
                  setProjectName={setProjectName}
                  projectDescription={projectDescription}
                  setProjectDescription={setProjectDescription}
                  handleCreateProject={handleCreateProject}
                  error={error}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
