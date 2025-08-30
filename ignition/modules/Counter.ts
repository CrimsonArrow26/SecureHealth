import { buildModule } from "@nomicfoundation/ignition-core";

export default buildModule("CounterModule", (m) => {
  const counter = m.contract("Counter");
  
  return { counter };
});
