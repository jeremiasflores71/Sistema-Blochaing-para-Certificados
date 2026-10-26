// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AcademicCertRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    struct Certificate { address issuer; uint64 issuedAt; uint64 revokedAt; bytes32 pdfHash; }
    mapping(bytes32 => Certificate) private certificates;
    event CertificateIssued(bytes32 indexed certHash, address indexed issuer, bytes32 pdfHash, uint64 issuedAt);
    event CertificateRevoked(bytes32 indexed certHash, address indexed by, uint64 revokedAt);
    constructor(address issuer) { _grantRole(DEFAULT_ADMIN_ROLE,msg.sender); _grantRole(ISSUER_ROLE,issuer); }
    function issue(bytes32 certHash, bytes32 pdfHash) external onlyRole(ISSUER_ROLE) {
        require(certHash != bytes32(0) && pdfHash != bytes32(0), "Empty hash");
        require(certificates[certHash].issuer == address(0), "AlreadyRegistered");
        certificates[certHash] = Certificate(msg.sender,uint64(block.timestamp),0,pdfHash);
        emit CertificateIssued(certHash,msg.sender,pdfHash,uint64(block.timestamp));
    }
    function revoke(bytes32 certHash) external {
        Certificate storage cert = certificates[certHash];
        require(cert.issuer != address(0), "NotFound");
        require(hasRole(DEFAULT_ADMIN_ROLE,msg.sender) || (hasRole(ISSUER_ROLE,msg.sender) && cert.issuer == msg.sender), "NotAuthorized");
        require(cert.revokedAt == 0, "AlreadyRevoked");
        cert.revokedAt = uint64(block.timestamp);
        emit CertificateRevoked(certHash,msg.sender,uint64(block.timestamp));
    }
    function verify(bytes32 certHash) external view returns(bool exists,bool revoked,address issuer,uint64 issuedAt,bytes32 pdfHash) {
        Certificate memory c = certificates[certHash];
        return(c.issuer != address(0),c.revokedAt > 0,c.issuer,c.issuedAt,c.pdfHash);
    }
}
