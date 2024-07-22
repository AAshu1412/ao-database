import {
  createDataItemSigner,
  spawn,
  message,
  result,
} from "@permaweb/aoconnect";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Ripples from "react-ripples";

export default function Home() {
  const [allProcessID, setAllProcessID] = useState([]); // Getting the list of the process ID
  const [userOwnProcessID, setUserOwnProcessID] = useState(""); // Getting Process ID from the User (Input)
  const [currentProcessID, setCurrentProcessID] = useState(""); // Current Process that is in use
  const [getDatabaseName, setGetDatabaseName] = useState(""); // Getting database name from the user
  const [databaseName, setDatabaseName] = useState(""); // Setting name of the database (Input)
  const [addColumn, setAddColumn] = useState({ name: "", data_type: "" }); // Column name and data type (Input)
  const [allColumn, setAllColumn] = useState([]); //  Array of the column name
  const [addDataInDatabase, setAddDataInDatabase] = useState(""); // Add Data in the Database (Input)
  const [allData, setAllData] = useState([]); //  Array of the database all data
  const [updateColumn, setUpdateColumn] = useState({
    column_name: "",
    new_column_data: "",
    id: 0,
  });
  const [isProcessCreationDone, setIsProcessCreationDone] = useState(false);
  const [isProcessLoad, setIsProcessLoad] = useState(false);
  const [changeFromCustomToUserInput, setchangeFromCustomToUserInput] =
    useState(false);
  const [rowIndex, setRowIndex] = useState(null);
  const [rowUpdate, setRowUpdate] = useState({});
  const [rowInputUpdate, setRowInputUpdate] = useState({});

  const stripAnsiCodes = (str) =>
    str.replace(
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ""
    );

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // SPWAN ------------------------------------------------------

  const check = async () => {
    try {
      const processId = await spawn({
        module: "sBmq5pehE1_Ed5YBs4DGV4FMftoKwo_cVVsCpPND36Q",
        scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
        signer: createDataItemSigner(window.arweaveWallet),
      });
      console.log(processId);
      setAllProcessID([...allProcessID, processId]);
      setCurrentProcessID(processId);
      setIsProcessCreationDone(true);
      toast.success("Successfully Creation of Process ID ");
    } catch (error) {
      console.log(error);
      toast.error("Unsuccessful Creation of Process ID ");
    }
  };

  // To Be Continued ----------------------------------------------------------

  const customProcess = async (process_id) => {
    try {
      setCurrentProcessID(process_id);
      setAllProcessID([...allProcessID, currentProcessID]);
      setIsProcessCreationDone(true);
      setchangeFromCustomToUserInput(true);
      // gettingDataInDatabase(databaseName);
      toast.success("Process Load Successfully ");
    } catch (error) {
      console.log(error);
      toast.error("Process Load Unsuccessfully ");
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Getting the all the columns name ----------------------------------------------------

  const showingAllColumns = async (database) => {
    const messageId = await message({
      process: currentProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: "Action", value: "Eval" }],
      data: `
schema_info = {}
for row in db:nrows("PRAGMA table_info(${database});") do
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
    console.log("showingAllColumns " + JSON.stringify(res1));
    if (res1.Output.data.output == undefined) {
      console.log(
        "showingAllColumns res.data : " + JSON.stringify(res1.Output.data)
      );
      console.log(
        "showingAllColumns res.data ----- " + stripAnsiCodes(res1.Output.data)
      );
      const _data = stripAnsiCodes(res1.Output.data);
      const valuesArray = extractValues(_data);
      setAllColumn(valuesArray);
      // gettingDataInDatabase(databaseName);
    } else {
      console.log(
        "showingAllColumns Data " + stripAnsiCodes(res1.Output.data.output)
      );
      console.log(
        "showingAllColumns type " +
          typeof stripAnsiCodes(res1.Output.data.output)
      );

      const _data = stripAnsiCodes(res1.Output.data.output);
      const valuesArray = extractValues(_data);
      setAllColumn(valuesArray);
    }
  };

  //  Load The New Database with column ID as a default -------------------------------------------------

  const load = async () => {
    try {
      const dbName = getDatabaseName;
      setDatabaseName(getDatabaseName);
      console.log("database name : " + dbName);
      const messageId = await message({
        process: currentProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: "Action", value: "Eval" }],
        data: `sqlite3 = require('lsqlite3')
      db = db or sqlite3.open_memory()
      MYDATABASE = [[
  CREATE TABLE IF NOT EXISTS ${dbName} (
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
      await showingAllColumns(dbName);
      toast.success("Process Load Successfully");
      setIsProcessLoad(true);
    } catch (error) {
      console.log(error);
      toast.error("Process Load Unsuccessfully");
    }
  };

  // Setting new column as per the requirement of the user --------------------------------------------------------

  const addingColumn = async (event) => {
    console.log("adding column database name : " + databaseName);
    try {
      event.preventDefault();
      const messageId = await message({
        process: currentProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: "Action", value: "Eval" }],
        data: `function add_column(table, column, data_type)

    local add_column = string.format("ALTER TABLE %s ADD COLUMN %s %s;", table, string.upper(column),string.upper(data_type))

     db:exec(add_column)
end

add_column("${databaseName}", "${addColumn.name}","${addColumn.data_type}") `,
      });
      console.log("addingColumn idddddd " + messageId);
      let res1 = await result({
        message: messageId,
        process: currentProcessID,
      });
      console.log("addingColumn data " + JSON.stringify(res1));
      await showingAllColumns(databaseName);
      toast.success("Column is Created Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Column is not Created");
    }
  };

  // Adding the Data in the Database -------------------------------------------------------

  const addingDataInDatabase = async (data) => {
    try {
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
insert_values_into_table("${databaseName}", values) `,
      });
      console.log("addingDataInDatabase idddddd " + messageId);
      let res1 = await result({
        message: messageId,
        process: currentProcessID,
      });
      console.log("addingDataInDatabase data " + JSON.stringify(res1));
      await gettingDataInDatabase(databaseName);
      toast.success("Data is Successfully Filled");
    } catch (error) {
      console.log(error);
      toast.error("Data not able to Filled");
    }
  };

  // Getting the data in the database for the display -------------------------------------

  const gettingDataInDatabase = async (database) => {
    const messageId = await message({
      process: currentProcessID,
      signer: createDataItemSigner(window.arweaveWallet),
      tags: [{ name: "Action", value: "Eval" }],
      data: `
attr_info = {}
local function get_table_columns(table_name)
     local columns = {}
    for row in db:nrows("PRAGMA table_info(" .. table_name .. ");") do
        columns[#columns + 1] = row.name
    end
    return columns
end

local function fetch_all_data(table_name)
    local columns = get_table_columns(table_name)

    for row in db:nrows("SELECT * FROM " .. table_name) do
        local processed_row = {}
        for _, column in ipairs(columns) do
            processed_row[column] = row[column] or "NULL"
        end
        table.insert(attr_info, processed_row)
    end

end

fetch_all_data("${database}")


return attr_info`,
    });
    console.log("gettingDataInDatabase idddddd " + messageId);
    let res1 = await result({
      message: messageId,
      process: currentProcessID,
    });
    console.log("gettingDataInDatabase data " + JSON.stringify(res1));
    console.log(
      "gettingDataInDatabase data " + stripAnsiCodes(res1.Output.data.output)
    );
    console.log(
      "gettingDataInDatabase type " +
        typeof stripAnsiCodes(res1.Output.data.output)
    );
    const _data = stripAnsiCodes(res1.Output.data.output);
    const resultArray = convertToArray(_data);
    setAllData(resultArray);
  };

  // Deleting data from the database -------------------------------------

  const deletingData = async (deleting_data_id) => {
    try {
      const messageId = await message({
        process: currentProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: "Action", value: "Eval" }],
        data: `
  function delete_values_into_table(table,idNumber,id)
  sqlite3 = require('lsqlite3')
      db = db or sqlite3.open_memory()

    local result = db:exec(string.format([[
        DELETE FROM "%s" WHERE "%s"="%s"
    ]],table,idNumber,id))
    if result ~= sqlite3.OK then
        error("Failed to insert values: " .. db:errmsg())
    end
end 

delete_values_into_table("${databaseName}","ID",${deleting_data_id});  `,
      });
      console.log("deletingData idddddd " + messageId);
      let res1 = await result({
        message: messageId,
        process: currentProcessID,
      });
      console.log("deletingData data " + JSON.stringify(res1));
      await gettingDataInDatabase(databaseName);
      toast.success("Data Deleted Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Data Not Deleted");
    }
  };

  // Updating any data in the database ------------------------------------------------------

  const updatingData = async (event) => {
    try {
      event.preventDefault();
      console.log("popopjmimknj : " + updateColumn.id);
      console.log(
        "updateColumn.new_column_data : " + updateColumn.new_column_data
      );

      console.log("updateColumn.column_name : " + updateColumn.column_name);

      console.log("databaseName : " + databaseName);

      const messageId = await message({
        process: currentProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: "Action", value: "Eval" }],
        data: `
  function update_values_into_table(table, attribute, attr,idNumber,id)
   sqlite3 = require('lsqlite3')
      db = db or sqlite3.open_memory()
    local result = db:exec(string.format([[
        UPDATE "%s" SET "%s"="%s" WHERE "%s"="%s"
    ]],table, attribute, attr,idNumber,id))
    if result ~= sqlite3.OK then
        error("Failed to insert values: " .. db:errmsg())
    end
end 

update_values_into_table("${databaseName}","${updateColumn.column_name}","${updateColumn.new_column_data}","id",${updateColumn.id}); `,
      });
      console.log("updatingData idddddd " + messageId);
      let res1 = await result({
        message: messageId,
        process: currentProcessID,
      });
      console.log("updatingData data " + JSON.stringify(res1));
      await gettingDataInDatabase(databaseName);
      toast.success("Data Updated Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Data Not Updated");
    }
  };

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Getting the array in JS of the column name ----------------------------------------

  const extractValues = (str) => {
    // Remove the curly braces and whitespace
    const trimmedStr = str.replace(/[{}]/g, "").trim();

    // Split the string by commas
    const valuesArray = trimmedStr
      .split(/\s*,\s*/)
      .map((value) => value.replace(/"/g, ""));
    console.log("ppppppppppppppoooooo : " + typeof valuesArray);

    console.log("ppppppppppppppoooooo : " + valuesArray);
    return valuesArray;
  };

  // Helping in getting the value (data for database) to pass the SQL query to set up data ---------------------------------

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

  // Getting the array of the data filled in the database

  const convertToArray = (str) => {
    // Step 1: Replace equals signs (=) with colons (:)
    let jsonStr = str.replace(/=/g, ":");

    // Step 2: Replace single quotes with double quotes
    jsonStr = jsonStr.replace(/'/g, '"');

    // Step 3: Wrap property names with double quotes
    jsonStr = jsonStr.replace(/(\w+)\s*:/g, '"$1":');

    // Step 4: Wrap the entire string in square brackets to create a valid JSON array
    jsonStr = jsonStr.replace(/\{(.+?)\}/gs, "{$1}");
    jsonStr = `[${jsonStr.slice(1, -1)}]`;

    // Step 5: Parse the JSON string into a JavaScript object
    const jsonObject = JSON.parse(jsonStr);

    return jsonObject;
  };
  // Column Input handling function ------------------------------------------------------------

  const handleInput = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    console.log("addColumn " + name, value);
    setAddColumn({ ...addColumn, [name]: value });
  };

  const handleUpdateDataFunction = (process_id) => {
    // const [updateColumn, setUpdateColumn] = useState({ column_name: "", new_column_data: "",id:0});
    // console.log(process_id);
    setUpdateColumn({ column_name: "", new_column_data: "", id: process_id });
  };

  const handleUpdateInput = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    console.log("updateColumn " + name, value);
    setUpdateColumn({ ...updateColumn, [name]: value });
  };

  const settingUpDatabaseName = async () => {
    let data = getDatabaseName;
    setDatabaseName(getDatabaseName);
    await showingAllColumns(data);
    setIsProcessLoad(true);
    await gettingDataInDatabase(data);
    toast.success("Process Load Successfully");
    console.log("-mkm-");
  };
  console.log(allData);

  const justcheck = async (delete_data) => {
    try {
      const messageId = await message({
        process: currentProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: "Action", value: "Eval" }],
        data: `
  sqlite3 = require('lsqlite3')
      db = db or sqlite3.open_memory()

    local result = db:exec(string.format([[
        DELETE FROM "${databaseName}" WHERE (${Object.entries(delete_data)
          .map((val) => `"${val[0]}" = "${val[1]}"`)
          .join(" AND ")})
    ]]))
    if result ~= sqlite3.OK then
        error("Failed to insert values: " .. db:errmsg())
    end
 

  `,
      });
      console.log("deletingData idddddd " + messageId);
      let res1 = await result({
        message: messageId,
        process: currentProcessID,
      });
      console.log("deletingData data " + JSON.stringify(res1));
      await gettingDataInDatabase(databaseName);
      toast.success("Data Deleted Successfully");
      // console.log(JSON.stringify(delete_data));
    } catch (error) {
      console.log(error);
      toast.error("Data Not Deleted");
    }
  };

  const justUpdate = async (_data, _id) => {
    setRowIndex(_id);
    console.log(JSON.stringify(_data));
    setRowUpdate(_data);
    setRowInputUpdate(_data);
  };
  const handInputIOOO = async (event) => {
    const name = event.target.name;
    const value = event.target.value;
    // console.log(name, value);
    setRowInputUpdate({ ...rowUpdate, [name]: value });
  };
  const dattaUpate = async () => {
    try {
      console.log(JSON.stringify(rowInputUpdate));
      console.log(JSON.stringify(rowUpdate));
      const constOne = Object.keys(rowUpdate);
      const UpdateOne = Object.keys(rowInputUpdate);
      const whereOne = {};
      const setOne = {};

      for (let i of constOne) {
        if (rowInputUpdate[i] == rowUpdate[i]) {
          whereOne[i] = rowInputUpdate[i];
        } else {
          setOne[i] = rowInputUpdate[i];
        }
      }
      console.log("ayushhhhhhhh : " + JSON.stringify(whereOne));
      console.log("ashuuuuuuuuu : " + JSON.stringify(setOne));
      console.log("popopjmimknj : " + updateColumn.id);
      console.log(
        "updateColumn.new_column_data : " + updateColumn.new_column_data
      );

      console.log("updateColumn.column_name : " + updateColumn.column_name);

      console.log("databaseName : " + databaseName);

      const messageId = await message({
        process: currentProcessID,
        signer: createDataItemSigner(window.arweaveWallet),
        tags: [{ name: "Action", value: "Eval" }],
        data: `
sqlite3 = require('lsqlite3')
  db = db or sqlite3.open_memory()
local result = db:exec(string.format([[
    UPDATE "${databaseName}" SET ${Object.keys(setOne)
          .map((val) => `"${val}"="${setOne[val]}"`)
          .join(", ")} WHERE (${Object.keys(whereOne)
          .map((val) => `"${val}"="${whereOne[val]}"`)
          .join(" AND ")})
]]))
if result ~= sqlite3.OK then
    error("Failed to insert values: " .. db:errmsg())
end
 `,
      });
      console.log("updatingData idddddd " + messageId);
      let res1 = await result({
        message: messageId,
        process: currentProcessID,
      });
      console.log("updatingData data " + JSON.stringify(res1));
      await gettingDataInDatabase(databaseName);
      setRowIndex(-1);
      toast.success("Data Updated Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Data Not Updated");
    }
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="flex flex-col mt-10 mx-4 gap-8">
      <div className="flex gap-4 items-center">
        {isProcessCreationDone ? (
          <div className="flex gap-8 items-center">
            <div className="flex gap-20 border-black	border-2 rounded-md p-4 justify-center">
              <h1 className="flex items-center justify-center bg-orange-600 w-[550px] h-10 text-xl font-medium rounded-md">
                {currentProcessID}
              </h1>
              <div className="flex gap-6">
                <h1 className="text-3xl font-medium">
                  Enter The Database Name :{" "}
                </h1>
                <input
                  autoComplete="off"
                  type="text"
                  placeholder="Enter Name of The Database"
                  value={getDatabaseName}
                  onChange={(event) => setGetDatabaseName(event.target.value)}
                  name="data_type"
                  id="data_type"
                  className="w-96 h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
                />
              </div>

              <Ripples
                color="black"
                during={1200}
                placeholder={"Random Anything"}
              >
                {changeFromCustomToUserInput ? (
                  <button
                    className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
                    onClick={settingUpDatabaseName}
                  >
                    Load
                  </button>
                ) : (
                  <button
                    className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
                    onClick={load}
                  >
                    Load
                  </button>
                )}
              </Ripples>
            </div>{" "}
            <Ripples
              color="black"
              during={1200}
              placeholder={"Random Anything"}
            >
              {changeFromCustomToUserInput ? (
                <button
                  className="bg-orange-600 w-24 h-16 text-xl font-medium rounded-md"
                  onClick={settingUpDatabaseName}
                >
                  REFRESH
                </button>
              ) : (
                <button
                  className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
                  onClick={load}
                >
                  REFRESH
                </button>
              )}
            </Ripples>{" "}
          </div>
        ) : (
          //  <div className="flex gap-2 border-black	border-2 rounded-md p-4">
          // <h1 className="text-3xl font-medium">
          //         Enter The Database Name :{" "}
          //       </h1>
          // <input
          //   type="text"
          //   placeholder="Enter Name of The Database"
          //   value={getDatabaseName}
          //   onChange={(event) => setGetDatabaseName(event.target.value)}
          //   name="data_type"
          //   id="data_type"
          //   className="w-96 h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
          // />
          //   <Ripples
          //     color="black"
          //     during={1200}
          //     placeholder={"Random Anything"}
          //   >
          //     <button
          //       className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
          //       onClick={settingUpDatabaseName}
          //     >
          //       Set
          //     </button>
          //   </Ripples>
          // </div>

          <div className="flex gap-10">
            {" "}
            <div className="border-black	border-2 rounded-md p-4">
              <Ripples
                color="black"
                during={1200}
                placeholder={"Random Anything"}
              >
                <button
                  onClick={check}
                  className="bg-orange-600 w-64 h-10 text-xl font-medium rounded-md "
                >
                  + Create New Process
                </button>
              </Ripples>
            </div>
            <div className="flex gap-2 border-black	border-2 rounded-md p-4">
              <input
                type="text"
                onChange={(event) => setUserOwnProcessID(event.target.value)}
                placeholder="Enter The Process ID"
                className="h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
              />
              <button
                className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
                onClick={() => customProcess(userOwnProcessID)}
              >
                Load
              </button>
            </div>
          </div>
        )}
        {/* To Be Continued ----------------------------------------------------------
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
            onClick={() => customProcess(userOwnProcessID)}
          >
            Load
          </button>
          
        </div> */}
      </div>
      <div>
        <h1 className="text-3xl font-semibold">CREATE NEW COLUMN</h1>
        <div className="border-black	border-2 rounded-md p-10">
          <form
            onSubmit={addingColumn}
            className="flex justify-around items-center"
          >
            <div className="flex gap-20 items-center">
              <div className="flex gap-2 items-center">
                <label className="text-3xl font-medium">
                  Enter The Column Name :{" "}
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
                  Enter The Column's Data Type :{" "}
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
            <Ripples
              color="black"
              during={1200}
              placeholder={"Random Anything"}
            >
              <button
                className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
                type="submit"
              >
                Add
              </button>
            </Ripples>
          </form>
        </div>
      </div>

      <div className=" flex flex-col justify-center items-center gap-4">
        <p className="text-xl font-medium">
          Enter data in the Database according to the attributes (Eg: 1,Tom,20
          with respect to ID,NAME,AGE)
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
          <Ripples color="black" during={1200} placeholder={"Random Anything"}>
            <button
              className="bg-orange-600 w-24 h-10 text-xl font-medium rounded-md"
              onClick={() => addingDataInDatabase(addDataInDatabase)}
            >
              Add
            </button>
          </Ripples>
        </div>
        <div>
          <h1 className="text-6xl font-bold underline underline-offset-4">
            {databaseName}
          </h1>
        </div>
      </div>
      <div className="w-full flex gap-16">
        <div className="w-[65%] overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              {/* <tr> */}
              {/* {isProcessCreationDone? <tr> {allColumn.map((val, key) => {
                return (
                  <th key={key} className="border px-4 py-2">
                    {val}
                  </th>
                  
                );
              })}
              <th className="border px-4 py-2">DELETE</th></tr>:<tr></tr>} */}
              <tr>
                {allColumn.map((columnName, index) => (
                  <th key={index} className="border px-4 py-2 text-xl">
                    {columnName}
                  </th>
                ))}
                {/* <th className="border px-4 py-2 text-xl">
                {isProcessLoad ? "DELETE" : "DATABASE"}
              </th> */}

                {isProcessLoad ? (
                  <>
                    <th className="border px-4 py-2 text-xl">UPDATE</th>
                    <th className="border px-4 py-2 text-xl">DELETE</th>
                  </>
                ) : (
                  <th className="border px-4 py-2 text-xl">DATABASE</th>
                )}
              </tr>

              {/* <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Message</th>
              <th className="border px-4 py-2">Delete</th> */}
              {/*  </tr> */}
            </thead>
            <tbody>
              {allData.map((curUser, index) => {
                const idPropertyName = Object.keys(curUser).find(
                  (key) => key.toLowerCase() === "id"
                );
                console.log("idPropertyName : " + idPropertyName);
                // console.log("columnName : "+columnName);

                return (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0 ? "even:bg-gray-100" : "odd:bg-white"
                    }
                  >
                    {allColumn.map((columnName, columnIndex) => {
                      return (
                        <>
                          {rowIndex === index ? (
                            <td className="border px-4 py-2 whitespace-nowrap text-xl">
                              {
                                //   Object.values(rowUpdate).map((val,key)=>{
                                // return(  index == key ? ( <input
                                //     key={key}
                                //     // type="text"
                                //     // required
                                //     autoComplete="off"
                                //     value={val}
                                //     onChange={handleUpdateInput}
                                //     name="new_column_data"
                                //     id="new_column_data"
                                //     className="w-auto border-black border-2 rounded-md"
                                // / >):(<></>
                                //    ))

                                // })
                                <input
                                  // type="text"
                                  // required
                                  autoComplete="off"
                                  value={rowInputUpdate[columnName]}
                                  onChange={handInputIOOO}
                                  name={columnName}
                                  id={columnName}
                                  className="w-auto border-black border-2 rounded-md"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      dattaUpate();
                                    }
                                  }}
                                />
                              }
                            </td>
                          ) : (
                            <td
                              key={columnIndex}
                              className="border px-4 py-2 whitespace-nowrap text-xl"
                            >
                              {curUser[columnName]}
                            </td>
                          )}
                        </>
                      );
                    })}
                    <td className="border px-4 py-2 bg-orange-600 rounded-md text-center text-xl font-medium">
                      <Ripples
                        color="black"
                        during={1200}
                        placeholder={"Random Anything"}
                      >
                        <button onClick={() => justcheck(curUser)}>
                          {/* deletingData(curUser[idPropertyName]) */}
                          Delete
                        </button>
                      </Ripples>
                    </td>
                    <td className="border px-4 py-2 bg-orange-600 rounded-md text-center text-xl font-medium">
                      <Ripples
                        color="black"
                        during={1200}
                        placeholder={"Random Anything"}
                      >
                        <button
                          onClick={() => justUpdate(curUser, index)}
                          // handleUpdateDataFunction(curUser[idPropertyName])
                          className="w-auto"
                        >
                          UPDATE
                        </button>
                      </Ripples>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* ///////////////////////////////////////////////
      <tbody>
        {allData.map((curUser, index) => (
          <tr key={index} className={index % 2 === 0 ? "even:bg-gray-100" : "odd:bg-white"}>
            {Object.keys(curUser).map((key) => (
              <td key={key} className="border px-4 py-2 whitespace-nowrap">
                {curUser[key]}
              </td>
            ))}
            <td className="border px-4 py-2">
              <button>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
      ///////////////////////////////////////////// */}
          </table>
        </div>
        <div className="w-[30%] flex flex-col gap-8 px-16 py-6 bg-orange-500 rounded-lg">
          <h1 className="text-7xl font-bold underline underline-offset-4">
            UPDATE <br /> (ID - {updateColumn.id})
          </h1>
          <form onSubmit={updatingData} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-xl">
              <label htmlFor="name">
                Enter The Column Name (Which You Wanna Update){" "}
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                value={updateColumn.column_name}
                onChange={handleUpdateInput}
                name="column_name"
                id="column_name"
                placeholder="Enter The Column Name"
                className="h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
              ></input>
            </div>

            <div className="flex flex-col gap-2 text-xl">
              <label htmlFor="name">Enter The Update Data </label>
              <input
                type="text"
                required
                autoComplete="off"
                value={updateColumn.new_column_data}
                onChange={handleUpdateInput}
                name="new_column_data"
                id="new_column_data"
                placeholder="Enter The Data"
                className="h-10 text-xl px-2 py-4 border-black border-2 rounded-md"
              ></input>
            </div>
            <Ripples
              color="black"
              during={1200}
              placeholder={"Random Anything"}
              className="w-auto"
            >
              <button
                type="submit"
                className="bg-orange-600 w-40 h-10 text-xl font-medium rounded-md mt-4"
              >
                UPDATE
              </button>
            </Ripples>
          </form>
        </div>
      </div>
    </div>
  );
}
