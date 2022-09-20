/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type { Collection, CollectionInterface } from "../Collection";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
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
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060f78061005f6000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c80638da5cb5b14602d575b600080fd5b60336047565b604051603e919060a8565b60405180910390f35b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000609482606b565b9050919050565b60a281608b565b82525050565b600060208201905060bb6000830184609b565b9291505056fea2646970667358221220dca7d9db6f0629e442f8932bdf69b06c4444b8a3a3db46166410c83bf9b2e54e64736f6c634300080d0033";

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
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Collection> {
    return super.deploy(overrides || {}) as Promise<Collection>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
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