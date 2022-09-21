/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  Collection,
  CollectionInterface,
} from "../../contracts/Collection";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Claim",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    name: "Distribution",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claim",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_to",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_amount",
        type: "uint256[]",
      },
    ],
    name: "distribute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "toBeClaimed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "toBeDistributed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60a06040523480156200001157600080fd5b5060405162001734380380620017348339818101604052810190620000379190620001c8565b620000576200004b6200009260201b60201c565b6200009a60201b60201c565b8073ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff168152505050620001fa565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000620001908262000163565b9050919050565b620001a28162000183565b8114620001ae57600080fd5b50565b600081519050620001c28162000197565b92915050565b600060208284031215620001e157620001e06200015e565b5b6000620001f184828501620001b1565b91505092915050565b60805161150262000232600039600081816103b5015281816105b5015281816107780152818161082401526108cc01526115026000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c8063715018a611610066578063715018a6146101355780638da5cb5b1461013f578063cc5b542e1461015d578063f2fde38b1461017b578063fc0c546a146101975761009e565b80632929abe6146100a35780633ccfd60b146100bf5780634e71d92d146100c957806367ee62f4146100e757806370a0823114610105575b600080fd5b6100bd60048036038101906100b89190610d07565b6101b5565b005b6100c7610356565b005b6100d161048e565b6040516100de9190610d8e565b60405180910390f35b6100ef610692565b6040516100fc9190610d8e565b60405180910390f35b61011f600480360381019061011a9190610da9565b610698565b60405161012c9190610d8e565b60405180910390f35b61013d6106b0565b005b6101476106c4565b6040516101549190610de5565b60405180910390f35b6101656106ed565b6040516101729190610d8e565b60405180910390f35b61019560048036038101906101909190610da9565b6106f3565b005b61019f610776565b6040516101ac9190610e5f565b60405180910390f35b6101bd61079a565b8051825114610201576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101f890610ed7565b60405180910390fd5b610209610818565b60005b82518110156103185781818151811061022857610227610ef7565b5b6020026020010151600260008282546102419190610f55565b9250508190555081818151811061025b5761025a610ef7565b5b60200260200101516003600085848151811061027a57610279610ef7565b5b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546102cb9190610f89565b925050819055508181815181106102e5576102e4610ef7565b5b6020026020010151600160008282546102fe9190610f89565b92505081905550808061031090610fdf565b91505061020c565b507f941e2db2d3f7223b69bfdd0b7f9ae133d58667b5a2abcd7969e975d226c00910828260405161034a9291906111a3565b60405180910390a15050565b61035e61079a565b600154600254116103a4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161039b9061124c565b60405180910390fd5b6000600254905060006002819055507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33836040518363ffffffff1660e01b815260040161040e92919061126c565b6020604051808303816000875af115801561042d573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061045191906112cd565b507f884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364338260405161048392919061126c565b60405180910390a150565b600080600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205411610511576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105089061136c565b60405180910390fd5b6000600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205490506000600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555080600160008282546105ac9190610f55565b925050819055507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33836040518363ffffffff1660e01b815260040161060e92919061126c565b6020604051808303816000875af115801561062d573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061065191906112cd565b507f47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4338260405161068392919061126c565b60405180910390a18091505090565b60015481565b60036020528060005260406000206000915090505481565b6106b861079a565b6106c26000610977565b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60025481565b6106fb61079a565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160361076a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610761906113fe565b60405180910390fd5b61077381610977565b50565b7f000000000000000000000000000000000000000000000000000000000000000081565b6107a2610a3b565b73ffffffffffffffffffffffffffffffffffffffff166107c06106c4565b73ffffffffffffffffffffffffffffffffffffffff1614610816576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161080d9061146a565b60405180910390fd5b565b6000600154036108c7577f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b815260040161087b9190610de5565b602060405180830381865afa158015610898573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108bc919061149f565b600281905550610975565b6001547f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016109239190610de5565b602060405180830381865afa158015610940573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610964919061149f565b61096e9190610f55565b6002819055505b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600033905090565b6000604051905090565b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610aa582610a5c565b810181811067ffffffffffffffff82111715610ac457610ac3610a6d565b5b80604052505050565b6000610ad7610a43565b9050610ae38282610a9c565b919050565b600067ffffffffffffffff821115610b0357610b02610a6d565b5b602082029050602081019050919050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610b4482610b19565b9050919050565b610b5481610b39565b8114610b5f57600080fd5b50565b600081359050610b7181610b4b565b92915050565b6000610b8a610b8584610ae8565b610acd565b90508083825260208201905060208402830185811115610bad57610bac610b14565b5b835b81811015610bd65780610bc28882610b62565b845260208401935050602081019050610baf565b5050509392505050565b600082601f830112610bf557610bf4610a57565b5b8135610c05848260208601610b77565b91505092915050565b600067ffffffffffffffff821115610c2957610c28610a6d565b5b602082029050602081019050919050565b6000819050919050565b610c4d81610c3a565b8114610c5857600080fd5b50565b600081359050610c6a81610c44565b92915050565b6000610c83610c7e84610c0e565b610acd565b90508083825260208201905060208402830185811115610ca657610ca5610b14565b5b835b81811015610ccf5780610cbb8882610c5b565b845260208401935050602081019050610ca8565b5050509392505050565b600082601f830112610cee57610ced610a57565b5b8135610cfe848260208601610c70565b91505092915050565b60008060408385031215610d1e57610d1d610a4d565b5b600083013567ffffffffffffffff811115610d3c57610d3b610a52565b5b610d4885828601610be0565b925050602083013567ffffffffffffffff811115610d6957610d68610a52565b5b610d7585828601610cd9565b9150509250929050565b610d8881610c3a565b82525050565b6000602082019050610da36000830184610d7f565b92915050565b600060208284031215610dbf57610dbe610a4d565b5b6000610dcd84828501610b62565b91505092915050565b610ddf81610b39565b82525050565b6000602082019050610dfa6000830184610dd6565b92915050565b6000819050919050565b6000610e25610e20610e1b84610b19565b610e00565b610b19565b9050919050565b6000610e3782610e0a565b9050919050565b6000610e4982610e2c565b9050919050565b610e5981610e3e565b82525050565b6000602082019050610e746000830184610e50565b92915050565b600082825260208201905092915050565b7f417267756d656e7473206172726179206c656e677468206e6f7420657175616c600082015250565b6000610ec1602083610e7a565b9150610ecc82610e8b565b602082019050919050565b60006020820190508181036000830152610ef081610eb4565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610f6082610c3a565b9150610f6b83610c3a565b925082821015610f7e57610f7d610f26565b5b828203905092915050565b6000610f9482610c3a565b9150610f9f83610c3a565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610fd457610fd3610f26565b5b828201905092915050565b6000610fea82610c3a565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff820361101c5761101b610f26565b5b600182019050919050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61105c81610b39565b82525050565b600061106e8383611053565b60208301905092915050565b6000602082019050919050565b600061109282611027565b61109c8185611032565b93506110a783611043565b8060005b838110156110d85781516110bf8882611062565b97506110ca8361107a565b9250506001810190506110ab565b5085935050505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61111a81610c3a565b82525050565b600061112c8383611111565b60208301905092915050565b6000602082019050919050565b6000611150826110e5565b61115a81856110f0565b935061116583611101565b8060005b8381101561119657815161117d8882611120565b975061118883611138565b925050600181019050611169565b5085935050505092915050565b600060408201905081810360008301526111bd8185611087565b905081810360208301526111d18184611145565b90509392505050565b7f576974686472617720756e7375636365737366756c3a20616c6c20746f6b656e60008201527f732061726520636c61696d61626c6520627920766f7465727300000000000000602082015250565b6000611236603983610e7a565b9150611241826111da565b604082019050919050565b6000602082019050818103600083015261126581611229565b9050919050565b60006040820190506112816000830185610dd6565b61128e6020830184610d7f565b9392505050565b60008115159050919050565b6112aa81611295565b81146112b557600080fd5b50565b6000815190506112c7816112a1565b92915050565b6000602082840312156112e3576112e2610a4d565b5b60006112f1848285016112b8565b91505092915050565b7f436c61696d20756e7375636365737366756c3a20796f75722062616c616e636560008201527f2069732030000000000000000000000000000000000000000000000000000000602082015250565b6000611356602583610e7a565b9150611361826112fa565b604082019050919050565b6000602082019050818103600083015261138581611349565b9050919050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b60006113e8602683610e7a565b91506113f38261138c565b604082019050919050565b60006020820190508181036000830152611417816113db565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b6000611454602083610e7a565b915061145f8261141e565b602082019050919050565b6000602082019050818103600083015261148381611447565b9050919050565b60008151905061149981610c44565b92915050565b6000602082840312156114b5576114b4610a4d565b5b60006114c38482850161148a565b9150509291505056fea26469706673582212206e6a95b4d0511c5a21a04448143892618a10f919574564387a2b465889843f9564736f6c634300080d0033";

type CollectionConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CollectionConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Collection__factory extends ContractFactory {
  constructor(...args: CollectionConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Collection> {
    return super.deploy(_token, overrides || {}) as Promise<Collection>;
  }
  override getDeployTransaction(
    _token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_token, overrides || {});
  }
  override attach(address: string): Collection {
    return super.attach(address) as Collection;
  }
  override connect(signer: Signer): Collection__factory {
    return super.connect(signer) as Collection__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CollectionInterface {
    return new utils.Interface(_abi) as CollectionInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Collection {
    return new Contract(address, _abi, signerOrProvider) as Collection;
  }
}
