const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const twilio = require('twilio');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Oracle DB configuration
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Twilio configuration
// Replace these with your actual Twilio credentials
const twilioAccountSid = 'AC769d7091e2fb58d36365012f2698edba';
const twilioAuthToken = '364ed417d8b4c9e7bd9c9cc72c55ef79';
const twilioPhoneNumber = '+15515252060';
const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

// Connect to Oracle DB
async function getConnection() {
  return await oracledb.getConnection({
    user: "hr",
    password: "hr",
    connectionString: "localhost/xepdb1"
  });
}

// Generate 6-digit OTP
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// Store OTP in database
async function storeOtp(mobileNumber, otp) {
  let connection;
  try {
    connection = await getConnection();

    // Set expiration time for OTP (5 minutes)
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);

    // First delete any existing OTPs for this mobile number
    await connection.execute(
      `DELETE FROM otp_requests WHERE mobile_number = :mobile_number`,
      { mobile_number: mobileNumber }
    );

    // Insert new OTP
    const sql = `
      INSERT INTO otp_requests (mobile_number, otp, otp_expiration)
      VALUES (:mobile_number, :otp, :otp_expiration)
    `;

    await connection.execute(sql, {
      mobile_number: mobileNumber,
      otp: otp,
      otp_expiration: otpExpiration
    });

    // Commit the transaction
    await connection.commit();
    return true;
  } catch (err) {
    console.error('Error storing OTP:', err);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// Send OTP via Twilio
async function sendSmsOtp(mobileNumber, otp) {
  try {
    await twilioClient.messages.create({
      body: `Your verification code is: ${otp}. This code expires in 5 minutes.`,
      from: twilioPhoneNumber,
      to: mobileNumber
    });
    return true;
  } catch (err) {
    console.error('Twilio SMS error:', err);
    return false;
  }
}

// Verify OTP from database
async function verifyOtp(mobileNumber, otp) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM otp_requests 
       WHERE mobile_number = :mobile_number 
       AND otp = :otp 
       AND otp_expiration > SYSDATE`,
      {
        mobile_number: mobileNumber,
        otp: otp
      }
    );

    return result.rows.length > 0;
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// API endpoint to send OTP
app.post('/send-otp', async (req, res) => {
  const { mobile_number } = req.body;

  if (!mobile_number) {
    return res.status(400).json({ 
      success: false, 
      message: 'Mobile number is required' 
    });
  }

  try {
    // Generate OTP
    const otp = generateOtp();

    // Store OTP in database
    const stored = await storeOtp(mobile_number, otp);
    if (!stored) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to store OTP' 
      });
    }

    // Send OTP via SMS
    const sent = await sendSmsOtp(mobile_number, otp);
    
    if (sent) {
      return res.status(200).json({ 
        success: true, 
        message: 'OTP sent successfully' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send SMS. Please try again.' 
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      details: err.message 
    });
  }
});

// API endpoint to verify OTP
app.post('/verify-otp', async (req, res) => {
  const { mobile_number, otp } = req.body;

  if (!mobile_number || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Mobile number and OTP are required' 
    });
  }

  try {
    const isValid = await verifyOtp(mobile_number, otp);
    
    if (isValid) {
      return res.status(200).json({ 
        success: true, 
        message: 'OTP verified successfully' 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      details: err.message 
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});