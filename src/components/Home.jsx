import { createDataItemSigner, spawn } from "@permaweb/aoconnect";
import { useEffect, useState } from "react";

export default function Home() {
  const [allProcessID, setAllProcessID] = useState([]);
  const [specificProcessID, setSpecificProcessID] = useState("");
  const [isProcessLoad, setIsProcessLoad] = useState(false);

  const check = async () => {
    const processId = await spawn({
      module: "1PdCJiXhNafpJbvC-sjxWTeNzbf9Q_RfUNs84GYoPm0",
      scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
      signer: createDataItemSigner(window.arweaveWallet),
    });
    console.log(processId);
    setAllProcessID([...allProcessID, processId]);
    setIsProcessLoad(true);
  };

  console.log("fooooooooooo : " + allProcessID.length);
  console.log(specificProcessID);

  return (
    <div className="flex flex-col mt-10 ml-4">
      <div className="flex gap-4 items-center">
        {isProcessLoad ? (
          <h1 className="flex items-center justify-center bg-orange-600 w-[550px] h-10 text-xl font-medium rounded-md">
            {allProcessID[allProcessID.length - 1]}
          </h1>
        ) : (
          <button
            onClick={check}
            className="bg-orange-600 w-64 h-10 text-xl font-medium rounded-md "
          >
            + Create New Process
          </button>
        )}
        OR
        <div className="flex gap-2">
          <input
            type="text"
            onChange={(event) => setSpecificProcessID(event.target.value)}
            placeholder="Enter The Process ID"
            className="h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
          />
          <button className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md">
            Load
          </button>
        </div>
      </div>
    </div>
  );
}
