const assert=require('node:assert/strict');const {ethers}=require('hardhat');
describe('AcademicCertRegistry · contrato real',function(){
 let registry,admin,issuer,other;const hash=ethers.sha256(ethers.toUtf8Bytes('datos académicos con salt'));const pdf=ethers.sha256(ethers.toUtf8Bytes('PDF original'));
 beforeEach(async()=>{[admin,issuer,other]=await ethers.getSigners();registry=await(await ethers.getContractFactory('AcademicCertRegistry')).deploy(issuer.address);await registry.waitForDeployment();});
 it('registra ambos hashes y emite evento',async()=>{const r=await(await registry.connect(issuer).issue(hash,pdf)).wait();assert.equal(registry.interface.parseLog(r.logs[0]).name,'CertificateIssued');const c=await registry.verify(hash);assert.equal(c.exists,true);assert.equal(c.revoked,false);assert.equal(c.pdfHash,pdf);assert.equal(c.issuer,issuer.address);});
 it('rechaza emisión no autorizada y hashes vacíos',async()=>{await assert.rejects(registry.connect(other).issue(hash,pdf));await assert.rejects(registry.connect(issuer).issue(ethers.ZeroHash,pdf));});
 it('rechaza emisión duplicada',async()=>{await registry.connect(issuer).issue(hash,pdf);await assert.rejects(registry.connect(issuer).issue(hash,pdf));});
 it('un hash inexistente jamás es válido',async()=>assert.equal((await registry.verify(hash)).exists,false));
 it('permite revocar al emisor original y conserva el registro',async()=>{await registry.connect(issuer).issue(hash,pdf);const r=await(await registry.connect(issuer).revoke(hash)).wait();assert.equal(registry.interface.parseLog(r.logs[0]).name,'CertificateRevoked');const c=await registry.verify(hash);assert.equal(c.exists,true);assert.equal(c.revoked,true);await assert.rejects(registry.connect(issuer).revoke(hash));});
 it('otro emisor no puede revocar certificados ajenos',async()=>{await registry.connect(issuer).issue(hash,pdf);await registry.grantRole(await registry.ISSUER_ROLE(),other.address);await assert.rejects(registry.connect(other).revoke(hash));});
 it('el administrador puede revocar y retirar autorización',async()=>{await registry.connect(issuer).issue(hash,pdf);await registry.revoke(hash);assert.equal((await registry.verify(hash)).revoked,true);await registry.revokeRole(await registry.ISSUER_ROLE(),issuer.address);await assert.rejects(registry.connect(issuer).issue(pdf,hash));});
 it('rechaza revocación inexistente y administración ajena',async()=>{await assert.rejects(registry.connect(issuer).revoke(hash));await assert.rejects(registry.connect(other).grantRole(await registry.ISSUER_ROLE(),other.address));});
});
