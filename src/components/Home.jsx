import {
  createDataItemSigner,
  spawn,
  message,
  result,
} from "@permaweb/aoconnect";
import { useEffect, useState } from "react";

export default function Home() {
  const [allProcessID, setAllProcessID] = useState([]);
  const [userOwnProcessID, setUserOwnProcessID] = useState("");
  const [currentProcessID, setCurrentProcessID] = useState("");
  const [addColumn, setAddColumn] = useState({ name: "", data_type: "" });
  const [allColumn, setAllColumn] = useState([]);
  const [addDataInDatabase, setAddDataInDatabase] = useState("");
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

  // const setUpLsqlite3 = async () => {
  //   const messageId = await message({
  //     process: currentProcessID,
  //     signer: createDataItemSigner(window.arweaveWallet),
  //     tags: [{ name: "Action", value: "Eval" }],
  //     data: `sqlite3 = require('lsqlite3')
  //   db = db or sqlite3.open_memory()
  //   return "OK"`,
  //   });
  //   console.log("idddddd " + messageId);
  //   let res1 = await result({
  //     message: messageId,
  //     process: currentProcessID,
  //   });
  //   console.log("data " + JSON.stringify(res1));
  // };
  // setUpLsqlite3();

  const showingAllColumns = async () => {
    const messageId = await message({
      process: currentProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: "Action", value: "Eval" }],
      data: `
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
    console.log("showingAllColumns idddddd " + messageId);
    let res1 = await result({
      message: messageId,
      process: currentProcessID,
    });
    console.log(
      "showingAllColumns Data " + stripAnsiCodes(res1.Output.data.output)
    );
    console.log(
      "showingAllColumns type " + typeof stripAnsiCodes(res1.Output.data.output)
    );

    const _data = stripAnsiCodes(res1.Output.data.output);
    extractValues(_data);
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
`,
    });
    console.log("load idddddd " + messageId);
    let res1 = await result({
      message: messageId,
      process: currentProcessID,
    });
    console.log("load data " + JSON.stringify(res1));
    showingAllColumns();
  };

  const addingColumn = async (event) => {
    event.preventDefault();
    const messageId = await message({
      process: currentProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: "Action", value: "Eval" }],
      data: `function add_column(table, column, data_type)

    local add_column = string.format("ALTER TABLE %s ADD COLUMN %s %s;", table, string.upper(column),string.upper(data_type))

     db:exec(add_column)
end

add_column("MyDatabase", "${addColumn.name}","${addColumn.data_type}") `,
    });
    console.log("addingColumn idddddd " + messageId);
    let res1 = await result({
      message: messageId,
      process: currentProcessID,
    });
    console.log("addingColumn data " + JSON.stringify(res1));
    showingAllColumns();
  };

  const addingDataInDatabase = async (data) => {
    const values = convertToArrayString(data);
    const messageId = await message({
      process: currentProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: "Action", value: "Eval" }],
      data: `function insert_values_into_table(table, values)
    local value_string = ""
    for i, value in ipairs(values) do

        if type(value) == "string" then
            value = value:gsub("'", "''")
            value_string = value_string .. string.format("'%s'", value)
        else
            value_string = value_string .. tostring(value)
        end
        if i < #values then
            value_string = value_string .. ", "
        end
    end

   local insert_sql = string.format("INSERT INTO %s VALUES (%s);", table, value_string)


    local result = db:exec(insert_sql)
    if result ~= sqlite3.OK then
        error("Failed to insert values: " .. db:errmsg())
    end

end

local values = ${values}
insert_values_into_table("MyDatabase", values) `,
    });
    console.log("addingColumn idddddd " + messageId);
    let res1 = await result({
      message: messageId,
      process: currentProcessID,
    });
    console.log("addingColumn data " + JSON.stringify(res1));
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////

  // console.log("fooooooooooo : " + allProcessID.length);
  // console.log(currentProcessID);
  const extractValues = (str) => {
    // Remove the curly braces and whitespace
    const trimmedStr = str.replace(/[{}]/g, "").trim();

    // Split the string by commas
    const valuesArray = trimmedStr
      .split(/\s*,\s*/)
      .map((value) => value.replace(/"/g, ""));
    console.log("ppppppppppppppoooooo : " + typeof valuesArray);

    console.log("ppppppppppppppoooooo : " + valuesArray);
    setAllColumn(valuesArray);
  };

  const convertToArrayString = (str) => {
    // Split the string by commas
    const values = str.split(",");

    // Convert each element to the appropriate data type
    const convertedValues = values.map((value) => {
      if (!isNaN(value)) {
        // Convert to number if it's numeric
        return Number(value);
      } else {
        // Keep it as a string otherwise
        return `"${value}"`;
      }
    });

    // Join the values with commas and wrap in curly braces
    const resultString = `{${convertedValues.join(",")}}`;

    return resultString;
  };

  const handleInput = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    console.log("addColumn " + name, value);
    setAddColumn({ ...addColumn, [name]: value });
  };

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
            onChange={(event) => setUserOwnProcessID(event.target.value)}
            placeholder="Enter The Process ID"
            className="h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
          />
          <button
            className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
            onClick={() => setCurrentProcessID(userOwnProcessID)}
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
      <div className="border-black	border-2 rounded-md p-10">
        <form
          onSubmit={addingColumn}
          className="flex justify-around items-center"
        >
          <div className="flex gap-20 items-center">
            <div className="flex gap-2 items-center">
              <label className="text-3xl font-medium">
                Create New Column :{" "}
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                placeholder="Enter The Column"
                value={addColumn.name}
                onChange={handleInput}
                name="name"
                id="name"
                className="h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
              />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-3xl font-medium">
                Create New Column :{" "}
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                placeholder="Enter The Column Data Type"
                value={addColumn.data_type}
                onChange={handleInput}
                name="data_type"
                id="data_type"
                className="h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
              />
            </div>
          </div>

          <button
            className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
            type="submit"
          >
            Add
          </button>
        </form>
      </div>
      <div className=" flex flex-col justify-center items-center gap-4">
        <p className="text-xl font-medium">
          Enter data in the Database according to the attributes (Eg: 1,Tom,20)
        </p>
        <div className="w-full flex justify-center gap-16">
          <input
            type="text"
            placeholder="Enter The Data in your Database"
            value={addDataInDatabase}
            onChange={(event) => setAddDataInDatabase(event.target.value)}
            name="data_type"
            id="data_type"
            className="w-[70%] h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
          />

          <button
            className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
            onClick={() => addingDataInDatabase(addDataInDatabase)}
          >
            Add
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-[100%] border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              {allColumn.map((val, key) => {
                return (
                  <th key={key} className="border px-4 py-2">
                    {val}
                  </th>
                );
              })}
              {/* <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Message</th>
              <th className="border px-4 py-2">Delete</th> */}
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
