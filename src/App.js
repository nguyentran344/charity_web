import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate, // ← ĐÃ THÊM DÒNG NÀY
} from "react-router-dom";
import { ethers } from "ethers";

// Components & Pages
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import CreateProjectForm from "./components/CreateProjectForm";
// Thay bằng địa chỉ contract mới bạn vừa deploy (hoặc dùng tạm cái cũ)
const contractAddress = "0xB7Ada9f4106E36b476393D03D734DCFc252FaC3f";
const contractABI = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_category", type: "string" },
      { internalType: "uint256", name: "_goal", type: "uint256" }, // Thêm tham số goal khi tạo dự án
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
          { internalType: "uint256", name: "goal", type: "uint256" }, // Thêm trường goal
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
];

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State cho form tạo dự án (dùng chung với CreateProjectForm)
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length > 0) {
        await connectWalletHandler(accounts[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Vui lòng cài MetaMask!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      await connectWalletHandler(accounts[0]);
    } catch (err) {
      setError("Kết nối ví thất bại: " + err.message);
    }
  };

  const connectWalletHandler = async (account) => {
    setCurrentAccount(account);
    setWalletConnected(true);
    setError("");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    setContract(contractInstance);
    await loadProjects(contractInstance);
  };

  const loadProjects = async (contractInstance) => {
    try {
      const count = await contractInstance.projectCount();
      const loaded = [];
      for (let i = 1; i <= Number(count); i++) {
        const p = await contractInstance.getProject(i);
        const savedImage = localStorage.getItem(`project-image-${p.id}`);
        loaded.push({
          id: Number(p.id),
          name: p.name,
          description: p.description,
          category: p.category,
          creator: p.creator,
          totalDonated: ethers.formatEther(p.totalDonated),
          goal: ethers.formatEther(p.goal),
          active: p.active,
          imageUrl:
            savedImage || "https://placehold.co/400x300?text=Charity+Project",
        });
      }
      setProjects(loaded.reverse()); // mới nhất lên đầu
    } catch (err) {
      console.error("Load projects error:", err);
    }
  };

  const handleCreateProject = async (name, description, imageUrl, category) => {
    if (!contract) return;
    setLoading(true);
    setError("");
    try {
      const tx = await contract.createProject(
        name,
        description,
        category,
        ethers.parseEther("10") // bạn có thể thêm field goal sau
      );
      await tx.wait();

      const newId = await contract.projectCount();
      localStorage.setItem(`project-image-${newId}`, imageUrl);

      alert("Tạo dự án thành công! Cảm ơn lòng tốt của bạn");
      await loadProjects(contract);

      // Reset form
      setProjectName("");
      setProjectDescription("");
    } catch (err) {
      setError(err.reason || err.message || "Giao dịch thất bại");
    } finally {
      setLoading(false);
    }
  };

  // THÊM HÀM NÀY VÀO App.js – NGAY SAU handleCreateProject
  const handleDonate = async (
    projectId,
    amount,
    message,
    isAnonymous,
    donorName
  ) => {
    if (!contract || !walletConnected) {
      setError("Vui lòng kết nối ví MetaMask");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const tx = await contract.donate(
        projectId,
        message || "",
        isAnonymous || false,
        isAnonymous ? "" : donorName || "",
        { value: ethers.parseEther(amount.toString()) }
      );
      await tx.wait();

      alert("Quyên góp thành công! Cảm ơn tấm lòng của bạn");
      await loadProjects(contract); // refresh lại danh sách
    } catch (err) {
      console.error("Donate error:", err);
      setError(err.reason || err.message || "Giao dịch thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Nếu bạn có nút "Kết thúc dự án" thì thêm luôn hàm này (tùy chọn)
  const handleEndProject = async (projectId) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.endProject(projectId);
      await tx.wait();
      alert("Dự án đã được kết thúc");
      await loadProjects(contract);
    } catch (err) {
      setError(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <Navbar
        currentAccount={currentAccount}
        walletConnected={walletConnected}
        connectWallet={connectWallet}
      />

      {loading && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 px-8 py-4 rounded-full shadow-lg z-50 font-bold">
          Đang xử lý giao dịch...
        </div>
      )}

      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-100 text-red-800 px-8 py-4 rounded-full shadow-lg z-50 font-bold max-w-2xl text-center">
          Lỗi: {error}
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home projects={projects} />} />

        <Route
          path="/project/:id"
          element={
            <ProjectDetail
              projects={projects}
              contract={contract}
              currentAccount={currentAccount}
              walletConnected={walletConnected}
              loadProjects={() => loadProjects(contract)}
              handleDonate={handleDonate}
            />
          }
        />

        {/* TRANG TẠO DỰ ÁN – CĂN GIỮA HOÀN HẢO, ĐẸP TUYỆT ĐỐI */}
        <Route
          path="/create-project"
          element={
            walletConnected ? (
              <div className="pt-24 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center">
                <CreateProjectForm
                  projectName={projectName}
                  setProjectName={setProjectName}
                  projectDescription={projectDescription}
                  setProjectDescription={setProjectDescription}
                  handleCreateProject={handleCreateProject}
                  error={error}
                />
              </div>
            ) : (
              <div className="pt-24 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center">
                <div className="text-center p-12 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl">
                  <h2 className="text-5xl font-bold text-purple-700 mb-8">
                    Kết nối ví để tạo dự án
                  </h2>
                  <button
                    onClick={connectWallet}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-6 px-16 rounded-full text-2xl shadow-xl hover:scale-105"
                  >
                    Kết Nối MetaMask
                  </button>
                </div>
              </div>
            )
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
