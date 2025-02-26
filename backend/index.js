const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const crypto = require('crypto');  // For generating OTP
const app = express();
const port = 5000;

const cors = require('cors');

const cors = require('cors');
app.use(cors());


// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Oracle DB configuration
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function insertOtp(mobileNumber, otp) {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: "hr",
      password: "hr",
      connectionString: "localhost/xepdb1"
    });

    // Set expiration time for OTP (e.g., 5 minutes)
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);

    const sql = `
      INSERT INTO otp_requests (mobile_number, otp, otp_expiration)
      VALUES (:mobile_number, :otp, :otp_expiration)
    `;

    // Execute the SQL query
    await connection.execute(sql, {
      mobile_number: mobileNumber,
      otp: otp,
      otp_expiration: otpExpiration
    });

    // Commit the transaction
    await connection.commit();

  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

// Generate OTP
function generateOtp() {
  // Generate a 6-digit OTP
  return crypto.randomInt(100000, 999999).toString();
}

// API to handle OTP registration
app.post('/register', async (req, res) => {
  const { mobile_number } = req.body;

  if (!mobile_number) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  try {
    // Generate OTP
    const otp = generateOtp();

    // Insert OTP into the database
    await insertOtp(mobile_number, otp);

    // In a real application, you would send the OTP to the user's mobile number via SMS

    return res.status(200).json({ message: 'OTP sent successfully', otp });
  } catch (err) {
    return res.status(500).json({ error: 'Error inserting OTP', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});








// const express = require('express');
// const oracledb = require('oracledb');
// const app = express();
// const cors = require('cors');
// const port = 5000;

// oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// app.use(cors());


// async function getPandaData() {
//   let connection;
//   try {
//     connection = await oracledb.getConnection({
//       user: "hr",
//       password: "hr",
//       connectionString: "localhost/xepdb1"
//     });

//     const result = await connection.execute(`SELECT * FROM panda`);

//     return result.rows; 
//   } catch (err) {
//     console.error(err);
//     return [];
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   }
// }

// app.get('/panda', async (req, res) => {
//   const data = await getPandaData();
//   res.json(data); 
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
