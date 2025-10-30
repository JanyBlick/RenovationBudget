# Deployment Information

## Contract Details

**Version**: v2.0 (Gateway Migrated)
**Network**: Ethereum Sepolia Testnet
**Chain ID**: 11155111

### Deployed Contract
- **Address**: `0x301258156b7D06e69A2E116fc8EC574B78D2EA38`
- **Transaction**: `0x792ad3ab484cba3329c12f1e5f2edf2c53dbd569028a56e5be884fe1835fb36c`
- **Block Explorer**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x301258156b7D06e69A2E116fc8EC574B78D2EA38)
- **Transaction Details**: [View TX](https://sepolia.etherscan.io/tx/0x792ad3ab484cba3329c12f1e5f2edf2c53dbd569028a56e5be884fe1835fb36c)

### Deployment Configuration

#### Owner
- **Address**: `0xd11299Bd7947810AAf1Ff7242509E97b4dF0Da0d`

#### Pausers (5 configured)
1. `0x0000000000000000000000000000000000000001`
2. `0x0000000000000000000000000000000000000002`
3. `0x0000000000000000000000000000000000000003`
4. `0x0000000000000000000000000000000000000004`
5. `0x0000000000000000000000000000000000000005`

#### KMS Configuration
- **KMS Generation**: 1
- **Initial State**: Not paused ✅

## Deployment Summary

```
============================================================
DEPLOYMENT SUMMARY
============================================================
Contract Address:   0x301258156b7D06e69A2E116fc8EC574B78D2EA38
Network:            sepolia
Chain ID:           11155111
Owner:              0xd11299Bd7947810AAf1Ff7242509E97b4dF0Da0d
Pausers:            5
KMS Generation:     1
Is Paused:          false
Tx Hash:            0x792ad3ab484cba3329c12f1e5f2edf2c53dbd569028a56e5be884fe1835fb36c
============================================================
```

## Verification Steps Completed

- ✅ Contract deployed successfully
- ✅ Owner address verified
- ✅ All 5 pauser addresses validated
- ✅ KMS generation set to 1
- ✅ Contract is in unpaused state
- ✅ All constructor parameters correct

## Migration Status

This deployment represents the successful migration from v1.0 to v2.0:

### Key Changes Implemented
1. ✅ PauserSet system with 5 pausers
2. ✅ KMS Generation tracking (v1)
3. ✅ Enhanced security with automatic re-randomization
4. ✅ Event-based decryption system
5. ✅ Boolean validation functions (is* instead of check*)
6. ✅ Emergency pause functionality

### All Original Features Preserved
- ✅ Encrypted room requirements
- ✅ Private budget calculation
- ✅ Encrypted contractor bids
- ✅ Bid comparison functionality
- ✅ Project approval system

## Next Steps

1. **Verify Contract on Etherscan**
   ```bash
   npx hardhat verify --network sepolia 0x301258156b7D06e69A2E116fc8EC574B78D2EA38 \
     "[0x0000000000000000000000000000000000000001,0x0000000000000000000000000000000000000002,0x0000000000000000000000000000000000000003,0x0000000000000000000000000000000000000004,0x0000000000000000000000000000000000000005]" \
     1
   ```

2. **Test Contract Functions**
   - Test pause/unpause functionality
   - Create test project
   - Submit test bid
   - Verify encrypted operations

3. **Update Frontend**
   - Update contract address in frontend config
   - Update ABI with new functions
   - Test new pause status indicators
   - Implement new event listeners

4. **Configure KMS Nodes**
   - Share contract address with KMS operators
   - Verify pauser addresses match KMS nodes
   - Test decryption request flow

## Important Notes

⚠️ **Security**: This is a testnet deployment. Do not use real funds.

⚠️ **Pausers**: The current pauser addresses (0x0000...0001-0005) are test addresses.
Replace with actual KMS node and coprocessor addresses before mainnet deployment.

⚠️ **KMS Generation**: Set to 1. Increment when KMS infrastructure is updated.

---

**Deployment Date**: 2025-10-17
**Deployer**: 0xd11299Bd7947810AAf1Ff7242509E97b4dF0Da0d
**Status**: ✅ Successful
**Version**: v2.0 (Gateway Compliant)
