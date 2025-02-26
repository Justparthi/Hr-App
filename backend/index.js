const express = require('express');
const oracledb = require('oracledb');
const app = express();
const cors = require('cors');
const port = 5000;

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

app.use(cors());


async function getPandaData() {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: "hr",
      password: "hr",
      connectionString: "localhost/xepdb1"
    });

    const result = await connection.execute(`SELECT * FROM panda`);

    return result.rows; 
  } catch (err) {
    console.error(err);
    return [];
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

app.get('/panda', async (req, res) => {
  const data = await getPandaData();
  res.json(data); 
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
