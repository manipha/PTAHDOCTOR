import { useState } from "react";

import BarChart from "./BarChart";
import AreaChart from "./AreaChart";
import Wrapper from "../wrappers/ChartsContainer";

const ChartsContainer = ({ data }) => {
  const [barChart, setBarChart] = useState(true);

  return (
    <Wrapper>
      <h4>ข้อมูลจำนวนคนไข้ทั้งหมด</h4>
      <button type="button" onClick={() => setBarChart(!barChart)}>
        {barChart ? "Bar Chart" : "Area Chart"}
      </button>
      {barChart ? <BarChart data={data} /> : <AreaChart data={data} />}
    </Wrapper>
  );
};

export default ChartsContainer;
