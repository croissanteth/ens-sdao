import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
//@ts-ignore
import nameHash from 'eth-ens-namehash';
import { getDeployer, logHre } from '../utils';
import {
  ENSDaoRegistrarPresetReservedLimited,
  ENSDaoRegistrarPresetReservedLimited__factory,
} from '../../types';

type DeployEnsDaoReservedLimitedArgs = {
  // ENS Registry address
  ens: string;
  // Public Resolver address
  resolver: string;
  // name of the .eth domain, the NFT name will be `${name}.eth DAO`
  name: string;
  // owner address of the contracts
  owner?: string;
  // reservation duration of the ENS DAO Registrar
  reservationDuration?: string;
  // limit of registrations
  registrationLimit?: number;
  // enabling logging
  log?: boolean;
};

export type DeployedEnsDaoReservedLimited = {
  ensDaoRegistrar: ENSDaoRegistrarPresetReservedLimited;
};

async function deploiementAction(
  {
    ens,
    resolver,
    name = 'sismo',
    owner: optionalOwner,
    reservationDuration = (4 * 7 * 24 * 3600).toString(),
    registrationLimit = 500,
    log,
  }: DeployEnsDaoReservedLimitedArgs,
  hre: HardhatRuntimeEnvironment
): Promise<DeployedEnsDaoReservedLimited> {
  if (log) await logHre(hre);

  const deployer = await getDeployer(hre, log);

  const owner = optionalOwner || deployer.address;

  const node = nameHash.hash(`${name}.eth`);

  const deployedRegistrar = await hre.deployments.deploy(
    'ENSDaoRegistrarPresetReservedLimited',
    {
      from: deployer.address,
      args: [
        ens,
        resolver,
        node,
        name,
        owner,
        reservationDuration,
        registrationLimit,
      ],
    }
  );

  const ensDaoRegistrar = ENSDaoRegistrarPresetReservedLimited__factory.connect(
    deployedRegistrar.address,
    deployer
  );

  if (log) {
    console.log(`Deployed ENS DAO Registrar: ${deployedRegistrar.address}`);
  }

  return {
    ensDaoRegistrar,
  };
}

task('deploy-ens-dao-reserved-limited')
  .addOptionalParam('ens', 'ens')
  .addOptionalParam('resolver', 'resolver')
  .addOptionalParam('baseURI', 'baseURI')
  .addOptionalParam('name', 'name')
  .addOptionalParam('owner', 'owner')
  .addOptionalParam('reservationDuration', 'reservationDuration')
  .addFlag('log', 'log')
  .addFlag('verify', 'Verify Etherscan Contract')
  .setAction(deploiementAction);
