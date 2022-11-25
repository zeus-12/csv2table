import { Button, Table, TextInput } from "@mantine/core";
import { useState } from "react";

export default function Home() {
  const [link1, setLink1] = useState("");
  const [link2, setLink2] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getData = async () => {
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link1, link2 }),
      });
      const data = await res.json();
      setData(data);
    } catch (err) {
      setError("Something went wrong!");
    }
  };

  const cols = [
    "PAN",
    "Name",
    "AY",
    "DIN",
    "Section_1",
    "DoD_1",
    "OSD_1",
    "Section_2",
    "DoD_2",
    "OSD_2",
  ];

  const calculateRemark = (cost1, cost2) => {
    console.log(cost1, cost2);
    if (!cost1 && cost2) return "No 1";
    else if (cost1 && !cost2) return "No 2";
    else if (cost1 > cost2) return "1 is higher";
    else if (cost1 < cost2) return "2 is higher";
    else if (cost1 === cost2) return "Same";
  };

  const submitHandler = async () => {
    if (!link1 || !link2) return;
    setLoading(true);
    await getData(link1, link2);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-16">
      <p className="text-4xl font-semibold tracking-tighter">Data</p>
      <p className="text-3xl tracking-tighter font-medium">Enter Links</p>

      <div className="flex gap-3">
        <TextInput
          className="w-[20vw]"
          placeholder="link 1"
          value={link1}
          onChange={(event) => setLink1(event.currentTarget.value)}
        />
        <TextInput
          className="w-[20vw]"
          placeholder="link 2"
          value={link2}
          onChange={(event) => setLink2(event.currentTarget.value)}
        />
        <Button onClick={submitHandler} loading={loading} variant="outline">
          Submit
        </Button>
        <p className="text-red-400">{error}</p>
      </div>

      <div className="mt-4">
        <Table>
          <thead>
            <tr>
              {cols.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((item) => (
                <tr key={item.PAN}>
                  {cols.map((col, i) => (
                    <td key={i}>{item[col]}</td>
                  ))}

                  <td>{calculateRemark(item.OSD_1, item.OSD_2)}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
