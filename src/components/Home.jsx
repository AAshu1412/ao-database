import {
  createDataItemSigner,
  spawn,
  message,
  result,
} from "@permaweb/aoconnect";
import { useEffect, useState } from "react";

export default function Home() {
  const [allProcessID, setAllProcessID] = useState([]);
  const [specificProcessID, setSpecificProcessID] = useState("");
  const [currentProcessID, setCurrentProcessID] = useState("");
  const [isProcessLoad, setIsProcessLoad] = useState(false);

  const stripAnsiCodes = (str) =>
    str.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ""
    );
  /////////////////////////////////////////////////////////////////////////////////////////////////////
  // SPWAN ------------------------------------------------------

  const check = async () => {
    const processId = await spawn({
      module: "sBmq5pehE1_Ed5YBs4DGV4FMftoKwo_cVVsCpPND36Q",
      scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
      signer: createDataItemSigner(window.arweaveWallet),
    });
    console.log(processId);
    setAllProcessID([...allProcessID, processId]);
    setCurrentProcessID(processId);
    setIsProcessLoad(true);
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////

  const setUpLsqlite3 = async () => {
    const messageId = await message({
      process: currentProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: "Action", value: "Eval" }],
      data: `sqlite3 = require('lsqlite3')
    db = db or sqlite3.open_memory()
    return "OK"`,
    });
    console.log("idddddd " + messageId);
    let res1 = await result({
      message: messageId,
      process: currentProcessID,
    });
    console.log("data " + JSON.stringify(res1));
  };
  // setUpLsqlite3();

  const newDatabase = async () => {
    const messageId = await message({
      process: currentProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: "Action", value: "Eval" }],
      data: `
MYDATABASE = [[
  CREATE TABLE IF NOT EXISTS MyDatabase (
    ID INTEGER PRIMARY KEY AUTOINCREMENT
  );
]]


function InitDb() 
  db:exec(MYDATABASE)
end

InitDb()`,
    });
    console.log("idddddd " + messageId);
    let res1 = await result({
      message: messageId,
      process: currentProcessID,
    });
    console.log("data " + JSON.stringify(res1));
  };

  const load = async () => {
    const messageId = await message({
      process: currentProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: "Action", value: "Eval" }],
      data: `sqlite3 = require('lsqlite3')
    db = db or sqlite3.open_memory()
    MYDATABASE = [[
CREATE TABLE IF NOT EXISTS MyDatabase (
  ID INTEGER PRIMARY KEY AUTOINCREMENT
);
]]


function InitDb() 
db:exec(MYDATABASE)
end

InitDb()
schema_info = {}
for row in db:nrows("PRAGMA table_info(MyDatabase);") do
      table.insert(schema_info, {name = row.name, type = row.type})
end
all_attribute={}

for _, values in ipairs(schema_info) do
  table.insert(all_attribute,values.name)
end

return all_attribute`,
    });
    console.log("idddddd " + messageId);
    let res1 = await result({
      message: messageId,
      process: currentProcessID,
    });
    console.log("data " + stripAnsiCodes(res1.Output.data.output));
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////

  // console.log("fooooooooooo : " + allProcessID.length);
  // console.log(currentProcessID);

  return (
    <div className="flex flex-col mt-10 mx-4 gap-8">
      <div className="flex gap-4 items-center">
        {isProcessLoad ? (
          <div className="flex gap-2 border-black	border-2 rounded-md p-4">
            <h1 className="flex items-center justify-center bg-orange-600 w-[550px] h-10 text-xl font-medium rounded-md">
              {currentProcessID}
            </h1>
            <button
              className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
              onClick={load}
            >
              Load
            </button>
          </div>
        ) : (
          <div className="border-black	border-2 rounded-md p-4">
            <button
              onClick={check}
              className="bg-orange-600 w-64 h-10 text-xl font-medium rounded-md "
            >
              + Create New Process
            </button>
          </div>
        )}
        OR
        <div className="flex gap-2 border-black	border-2 rounded-md p-4">
          <input
            type="text"
            onChange={(event) => setSpecificProcessID(event.target.value)}
            placeholder="Enter The Process ID"
            className="h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
          />
          <button
            className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
            onClick={() => setCurrentProcessID(specificProcessID)}
          >
            Load
          </button>
          {/* <button className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md" onClick={setUpLsqlite3}>
            Spwan
          </button>
          <button className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md" onClick={newDatabase}>
            Database
          </button>
          <button className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md" onClick={allAttributeField}>
            Attr
          </button> */}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-[100%] border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Message</th>
              <th className="border px-4 py-2">Delete</th>
            </tr>
          </thead>
          {/* <tbody>
              {contacts.map((curUser, index) => (
                <tr key={index} className="even:bg-gray-100 odd:bg-white">
                  <td className="border px-4 py-2 whitespace-nowrap">
                    {curUser.username}
                  </td>
                  <td className="border px-4 py-2">{curUser.email}</td>
                  <td className="border px-4 py-2">{curUser.message}</td>
                  <td className="border px-4 py-2">
                    <button onClick={() => deleteContact(curUser._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody> */}
        </table>
      </div>
    </div>
  );
}
