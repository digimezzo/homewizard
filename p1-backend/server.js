import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const P1_IP = "http://192.168.1.110";

app.get("/api/p1", async (req, res) => {
  try {
    const response = await fetch(`${P1_IP}/api/v1/data`);
    const data = await response.json();

    const phases = {
      l1:
        data.active_voltage_l1_v && data.active_current_l1_a
          ? data.active_voltage_l1_v * data.active_current_l1_a
          : null,
      l2:
        data.active_voltage_l2_v && data.active_current_l2_a
          ? data.active_voltage_l2_v * data.active_current_l2_a
          : null,
      l3:
        data.active_voltage_l3_v && data.active_current_l3_a
          ? data.active_voltage_l3_v * data.active_current_l3_a
          : null,
    };

    res.json({ ...data, phase_power: phases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
