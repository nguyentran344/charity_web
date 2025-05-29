import React, { useState } from "react";
import "./DonateForm.css";

const DonateForm = ({ projectId, handleDonate, walletConnected }) => {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [donorName, setDonorName] = useState("");

  const onDonate = async () => {
    if (!walletConnected) {
      alert("Vui lòng kết nối ví MetaMask");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (message.length > 200) {
      alert("Lời nhắn không được quá 200 ký tự");
      return;
    }
    if (!isAnonymous && !donorName.trim()) {
      alert("Vui lòng nhập tên nếu chọn công khai");
      return;
    }
    console.log("Donating with:", {
      projectId,
      amount,
      message,
      isAnonymous,
      donorName,
    });
    await handleDonate(projectId, amount, message, isAnonymous, donorName);
    setAmount("");
    setMessage("");
    setDonorName("");
    setIsAnonymous(true);
  };

  return (
    <div className="donate-form">
      <h3>Quyên góp cho dự án</h3>
      <input
        type="number"
        placeholder="Số tiền (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="form-input"
        step="0.001"
        min="0"
      />
      <textarea
        placeholder="Lời nhắn (tối đa 200 ký tự)"
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, 200))}
        className="form-textarea"
      />
      <div className="form-radio-group">
        <label>
          <input
            type="radio"
            checked={isAnonymous}
            onChange={() => setIsAnonymous(true)}
          />
          Ẩn danh
        </label>
        <label>
          <input
            type="radio"
            checked={!isAnonymous}
            onChange={() => setIsAnonymous(false)}
          />
          Công khai tên
        </label>
      </div>
      {!isAnonymous && (
        <input
          type="text"
          placeholder="Tên của bạn"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          className="form-input"
        />
      )}
      <button
        onClick={onDonate}
        className="form-button"
        disabled={!amount || (!isAnonymous && !donorName.trim())}
      >
        Quyên góp
      </button>
    </div>
  );
};

export default DonateForm;
