require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const auth = require("./middleware/auth");
const cookieparser = require("cookie-parser");

// Firebase Setup

var admin = require("firebase-admin");

var serviceAccount = require("../FirebaseKeys/fetchdata-830de-firebase-adminsdk-9bgm5-4c363cf208.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://fetchdata-830de-default-rtdb.firebaseio.com",
});

const firebase_db = admin.database();
const firebase_dbref = firebase_db.ref("data");

// Ethereum setup
const web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;

web3js = new web3(new web3.providers.HttpProvider("HTTP://127.0.0.1:7545"));

var myAddress = "0x553714dd3Df0D7556c99fccDE47563e1Ee0d1056";
var privateKey = Buffer.from(
  "3eb6aeb36ba2f07ff5f2610a8fe3f45da46186e3f3ae90528cf5edd158721a31",
  "hex"
);
var toAddress = "0x03909204ad8D805749AA81bE5C86964dc0E8c274";

//contract abi is the array that you can get from the ethereum wallet or etherscan
var contractABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_ProdName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_quantity",
        type: "string",
      },
      {
        internalType: "string",
        name: "_CreatedDate",
        type: "string",
      },
    ],
    name: "CreatedProd",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_Date",
        type: "string",
      },
    ],
    name: "DeliveredDate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "GetProd",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "ProdId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "ProdName",
            type: "string",
          },
          {
            internalType: "string",
            name: "ProdQty",
            type: "string",
          },
          {
            internalType: "string",
            name: "CreatedDate",
            type: "string",
          },
          {
            internalType: "string",
            name: "PickedDate",
            type: "string",
          },
          {
            internalType: "string",
            name: "DeliveredDate",
            type: "string",
          },
          {
            internalType: "bool",
            name: "IsPicked",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "Isdelivered",
            type: "bool",
          },
        ],
        internalType: "struct test.Prod",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "IotData_humidity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Items",
    outputs: [
      {
        internalType: "uint256",
        name: "ProdId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "ProdName",
        type: "string",
      },
      {
        internalType: "string",
        name: "ProdQty",
        type: "string",
      },
      {
        internalType: "string",
        name: "CreatedDate",
        type: "string",
      },
      {
        internalType: "string",
        name: "PickedDate",
        type: "string",
      },
      {
        internalType: "string",
        name: "DeliveredDate",
        type: "string",
      },
      {
        internalType: "bool",
        name: "IsPicked",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "Isdelivered",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_Date",
        type: "string",
      },
    ],
    name: "TriggerDelivery",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "get_IotData_humidity",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "humidity",
        type: "uint256[]",
      },
    ],
    name: "saveIotData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
var contractAddress = "0x5587fCC798Ce72D16fea0E38f1EDdC6C63089b71";
//creating contract object
var contract = new web3js.eth.Contract(contractABI, contractAddress);

/////////////////

require("./db/conn");
const Register = require("./models/registers");
const userRegister = require("./models/user");
const Registeruser = require("./models/user");
const authuser = require("./middleware/authuser");
// const bcrypt = require("bcryptjs/dist/bcrypt");
// const static_path =
// console.log(path.join(__dirname, "../public"))
const static_path = path.join(__dirname, "../public");
console.log(static_path, "hello");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use("/public", express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);
app.use(cookieparser());
hbs.registerPartials(partials_path);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/firebase", (req, res) => {
  const _id = req.query.id;
});
app.get("/owner", auth, (req, res) => {
  res.render("owner");
});
app.get("/delivery", auth, (req, res) => {
  res.render("delivery");
});
app.get("/buyer", auth, (req, res) => {
  res.render("buyer");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/data", (req, res) => {
  res.render("firebase");
});

app.get("/logout", auth, async (req, res) => {
  try {
    res.clearCookie("jwt");
    console.log("logout successfully");
    await req.user.save();
    // swal("bye!", "LogOut Successfully!", "success");
    res.render("index");
  } catch (error) {
    // swal("bye!", "LogOut Successfully!", "success");
    res.status(500).send(error);
  }
});
app.get("*", (req, res) => {
  res.status(404).render("error");
});

// creating new user on database
app.post("/owner", async (req, res) => {
  const IsEntered = await Register.findOne({ email: req.body.email });
  console.log(req.body);
  if (IsEntered == null) {
    try {
      const password = req.body.password;
      const cpassword = req.body.cpassword;
      if (password === cpassword) {
        const registerOwner = new Register({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          cpassword: req.body.cpassword,
        });

        const token = await registerOwner.generateAuthToken();
        // console.log("token is " + token)

        res.cookie("jwt", token, {
          expires: new Date(Date.now() + 600000),
          httpOnly: true,
        });

        const registered = await registerOwner.save();
        // console.log("token is " + token)
        // swal("Nice!", "Registered Successfully!", "success");
        res.status(201).render("index");
      } else {
        // swal("Oops!", "Registeration UnSuccessfully!", "danger");
        res.send("password not matching");
      }
    } catch (e) {
      res.status(400).send("Something happens");
    }
  } else {
    res.status(400).send("User already Exist");
  }
});

//user register
app.post("/user", async (req, res) => {
  const IsEntered = await userRegister.findOne({ email: req.body.email });
  console.log(req.body);
  if (IsEntered == null) {
    try {
      const password = req.body.password;
      const cpassword = req.body.cpassword;
      if (password === cpassword) {
        console.log("Entered");
        var registeruser = new Registeruser({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          cpassword: req.body.cpassword,
        });

        const token = await registeruser.generateAuthToken();
        // console.log("token is " + token)

        res.cookie("jwt", token, {
          expires: new Date(Date.now() + 600000),
          httpOnly: true,
        });

        const registered = await registeruser.save();
        console.log("token is " + token);
        // swal("Nice!", "Registered Successfully!", "success");
        res.status(201).render("index");
      } else {
        // swal("Oops!", "Registeration UnSuccessfully!", "danger");
        res.send("password not matching");
      }
    } catch (e) {
      res.status(400).send("Something happens");
    }
  } else {
    res.status(400).send("User already Exist");
  }
});

// owner login

app.post("/loginowner", async (req, res) => {
  try {
    const Enteredemail = req.body.email;
    const Enteredpassword = req.body.password;
    const userEmail = await Register.findOne({ email: Enteredemail });
    const isMatch = await bcrypt.compare(Enteredpassword, userEmail.password);
    const token = await userEmail.generateAuthToken();

    // console.log("token is " + token)

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 650000),
      httpOnly: true,
    });

    if (isMatch) {
      res.status(201).render("index");
    } else {
      swal("OOps!", "Login Unsuccessfull!", "danger");
      res.send("Invalid Credentials");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("invalid Credentials");
  }
});

// Userlogin
app.post("/loginuser", async (req, res) => {
  try {
    const Enteredemail = req.body.email;
    const Enteredpassword = req.body.password;
    const userEmail = await Registeruser.findOne({ email: Enteredemail });
    const isMatch = await bcrypt.compare(Enteredpassword, userEmail.password);
    const token = await userEmail.generateAuthToken2();

    console.log("token is " + token);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 650000),
      httpOnly: true,
    });

    if (isMatch) {
      res.status(201).render("index");
    } else {
      // swal("OOps!", "Login Unsuccessfull!", "danger");
      res.send("Invalid Credentials");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send("invalid Credentials");
  }
});

app.listen(port, () => {
  console.log(`server is running on ${port} ~~`);
});

////////////////////

async function executeTransaction(iotDevice) {}

async function pushData() {
  firebase_dbref.once("value", (snap) => {
    const data = snap.val();

    ////////////////

    var count;

    // get transaction count, later will used as nonce
    web3js.eth.getTransactionCount(myAddress).then(async function (v) {
      count = v;
      for (let i = 0; i < data.length; i++) {
        const ProdId = data[i].ProdId;
        const humidity = JSON.parse(data[i].humidity);

        console.log("Count: " + v);
        var amount = web3js.utils.toHex(1e16);
        //creating raw tranaction
        var rawTransaction = {
          from: myAddress,
          gasPrice: web3js.utils.toHex(40 * 1e9),
          gasLimit: web3js.utils.toHex(350000),
          to: contractAddress,
          value: "0x0",
          data: contract.methods.saveIotData(ProdId, humidity).encodeABI(),
          nonce: web3js.utils.toHex(count),
        };

        //creating tranaction via ethereumjs-tx
        var transaction = new Tx(rawTransaction);

        //signing transaction with private key
        transaction.sign(privateKey);

        //sending transacton via web3js module
        await web3js.eth
          .sendSignedTransaction("0x" + transaction.serialize().toString("hex"))
          .on("receipt", function (receipt) {
            console.log(receipt);
          });

        count++;
      }
    });
  });
}

pushData();

//////////////

// get transaction count, later will used as nonce
// web3js.eth.getTransactionCount(myAddress).then(function (v) {
//   console.log("Count: " + v);
//   count = v;
//   var amount = web3js.utils.toHex(1e16);
//   //creating raw tranaction
//   var rawTransaction = {
//     from: myAddress,
//     gasPrice: web3js.utils.toHex(40 * 1e9),
//     gasLimit: web3js.utils.toHex(350000),
//     to: contractAddress,
//     value: "0x0",
//     data: contract.methods.get_IotData_humidity(11111).encodeABI(),
//     nonce: web3js.utils.toHex(count),
//   };
//   console.log(rawTransaction);
//   //creating tranaction via ethereumjs-tx
//   var transaction = new Tx(rawTransaction);
//   //signing transaction with private key
//   transaction.sign(privateKey);
//   //sending transacton via web3js module

//   // web3js.eth
//   //   .sendSignedTransaction("0x" + transaction.serialize().toString("hex"))
//   //   .on("transactionHash", console.log)
//   //   .on("receipt", function (receipt) {
//   //     console.log(receipt);
//   //     res.json(data[0]);
//   //   });

//   contract.methods
//     .get_IotData_humidity(1010)
//     .call()
//     .then(function (data) {
//       console.log(data);
//       res.json(data);
//     });
// });
