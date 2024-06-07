import { ConnectButton, useConnection } from "@arweave-wallet-kit/react";
import { useNavigate, Link } from "react-router-dom";

export default function Front() {
  const { connected } = useConnection();
  const navigate = useNavigate();

  return (
    <div className="h-[90vh] flex flex-col justify-center items-center gap-6">
      <h1 className="text-3xl font-medium">Welcome To AO-DATABASE</h1>
      {connected ? navigate("/home") : <ConnectButton className="w-56 " />}
    </div>
  );
}
