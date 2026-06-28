import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CargoManifestJudgeModule", (m) => {
  const judge = m.contract("CargoManifestJudge");
  return { judge };
});
