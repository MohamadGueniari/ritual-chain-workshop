// ABI for CargoManifestJudge (commit-reveal sealed-cargo bounty on Ritual).
// Generated from the compiled artifact; do not edit by hand.
const abi = [
    {
        "inputs":  [

                   ],
        "name":  "AlreadyInspected",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "AlreadyOpened",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "AlreadyReleased",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "AlreadyShipped",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "BadAnswerLength",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "BadCutoffs",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "BadIndex",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "BarcodeMismatch",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "CannotCancel",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "CustomsClosed",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "CustomsNotFinished",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "CustomsNotOpen",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "EmptyBarcode",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "LoadingClosed",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ManifestFull",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NoContainer",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NoOpenedContainers",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NotInspected",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NotOwner",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "PayoutFailed",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "RewardRequired",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "UnknownManifest",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "WinnerNotOpened",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "openedCount",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes",
                           "name":  "report",
                           "type":  "bytes"
                       }
                   ],
        "name":  "BatchInspected",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "containerIndex",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "shipper",
                           "type":  "address"
                       }
                   ],
        "name":  "CargoOpened",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "containerIndex",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "shipper",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes32",
                           "name":  "barcode",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "CargoSealed",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "reward",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ManifestCancelled",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "string",
                           "name":  "title",
                           "type":  "string"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "reward",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint64",
                           "name":  "loadingCutoff",
                           "type":  "uint64"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint64",
                           "name":  "customsCutoff",
                           "type":  "uint64"
                       }
                   ],
        "name":  "ManifestCreated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "winner",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "shipper",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "reward",
                           "type":  "uint256"
                       }
                   ],
        "name":  "WinnerReleased",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "MAX_ANSWER_BYTES",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "MAX_CONTAINERS",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "NO_WINNER",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "RITUAL_WALLET",
        "outputs":  [
                        {
                            "internalType":  "contract IRitualWallet",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "cancelManifest",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "string",
                           "name":  "answer",
                           "type":  "string"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "salt",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "shipper",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "computeCommitment",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "pure",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "index",
                           "type":  "uint256"
                       }
                   ],
        "name":  "containerStatus",
        "outputs":  [
                        {
                            "internalType":  "enum CargoManifestJudge.ContainerStatus",
                            "name":  "",
                            "type":  "uint8"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "string",
                           "name":  "title",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "rubric",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "submissionDeadline",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "revealDeadline",
                           "type":  "uint256"
                       }
                   ],
        "name":  "createBounty",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "manifestId",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "payable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "entryCount",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "shipper",
                           "type":  "address"
                       }
                   ],
        "name":  "entrySlot",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "winnerIndex",
                           "type":  "uint256"
                       }
                   ],
        "name":  "finalizeWinner",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getBounty",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "owner",
                            "type":  "address"
                        },
                        {
                            "internalType":  "string",
                            "name":  "title",
                            "type":  "string"
                        },
                        {
                            "internalType":  "string",
                            "name":  "rubric",
                            "type":  "string"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "reward",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "submissionDeadline",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "revealDeadline",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "judged",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "finalized",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "submissionCount",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "revealedCount",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "winnerIndex",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "bytes",
                            "name":  "aiReport",
                            "type":  "bytes"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "index",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getSubmission",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "shipper",
                            "type":  "address"
                        },
                        {
                            "internalType":  "bytes32",
                            "name":  "barcode",
                            "type":  "bytes32"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "opened",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "string",
                            "name":  "contents",
                            "type":  "string"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes",
                           "name":  "llmInput",
                           "type":  "bytes"
                       }
                   ],
        "name":  "judgeAll",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "nextManifestId",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "phaseOf",
        "outputs":  [
                        {
                            "internalType":  "enum CargoManifestJudge.Phase",
                            "name":  "",
                            "type":  "uint8"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "string",
                           "name":  "answer",
                           "type":  "string"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "salt",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "revealAnswer",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "manifestId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "commitment",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "submitCommitment",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
] as const;

export default abi;

