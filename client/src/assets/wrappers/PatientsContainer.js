import styled from "styled-components";

const Wrapper = styled.section`
  margin-top: 4rem;
  h2 {
    text-transform: none;
  }
  & > h5 {
    font-weight: 700;
    margin-bottom: 1.5rem;
  }
  .patients {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 2rem;
  }
  .h5 {
    text-align: center;
    margin-bottom: 10px;
    margin-top: -30px;
    font-size: 18px;
  }
  .blah {
    text-align: center;
    font-size: 14px;
    color: gray;
    margin-bottom: 30px;
    line-height: 20px;
  }
  @media (min-width: 1120px) {
    .patients {
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
  }
`;
export default Wrapper;

