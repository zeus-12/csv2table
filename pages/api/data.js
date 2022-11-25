import fs from "fs";
import { parse } from "csv-parse";

export default async function handler(req, res) {
  let data = [];
  const { link1, link2 } = req.body;

  const fetchAndWriteData = async (link, name) => {
    const res = await fetch(link);
    const csvData = await res.text();

    fs.writeFile(`./public/${name}.csv`, csvData, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  };

  await fetchAndWriteData(link1, "data1");
  await fetchAndWriteData(link2, "data2");

  fs.createReadStream("./public/data1.csv")
    .pipe(
      parse({
        delimiter: ",",
        columns: true,
        ltrim: true,
      })
    )
    .on("data", function (row) {
      let {
        PAN,
        "Name of the Assessee": Name,
        Section: Section_1,
        AY,
        "Date of Demand": DoD_1,
        "Outstanding demand Amount": OSD_1,
        "Demand Identification Number(DIN)": DIN,
      } = row;

      let cur = { PAN, Name, Section_1, AY, DoD_1, OSD_1, DIN };

      data.push(cur);
    })
    .on("error", function (error) {
      console.log(error.message);
    })
    .on("end", function () {
      fs.createReadStream("./public/data2.csv")
        .pipe(
          parse({
            delimiter: ",",
            columns: true,
            ltrim: true,
          })
        )
        .on("data", function (row) {
          let index = data.findIndex((item) => item.PAN === row.PAN);
          if (index === -1) {
            // PAN does not exist in the data array
            let {
              PAN,
              "Name of the Assessee": Name,
              Section: Section_2,
              AY,
              "Date of Demand": DoD_2,
              "Outstanding demand Amount": OSD_2,
              "Demand Identification Number(DIN)": DIN,
            } = row;

            let cur = { PAN, Name, Section_2, AY, DoD_2, OSD_2, DIN };

            data.push(cur);
          } else {
            // PAN exists in the data array
            data[index].Section_2 = row.Section;
            data[index].DoD_2 = row["Date of Demand"];
            data[index].OSD_2 = row["Outstanding demand Amount"];
          }
        })
        .on("error", function (error) {
          console.log(error.message);
        })
        .on("end", function () {
          return res.status(200).json(data);
        });
    });
}
