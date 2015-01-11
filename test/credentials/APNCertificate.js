var APNCertificate = require("../../lib/credentials/APNCertificate");
var APNKey = require("../../lib/credentials/APNKey");
var forge = require("node-forge");
var fs = require("fs");

describe("APNCertificate", function() {
	var certPem;
	before(function() {
		certPem = fs.readFileSync("test/credentials/support/cert.pem");
	});

	var cert;
	beforeEach(function() {
		cert = forge.pki.certificateFromPem(certPem.toString());
	});

	describe("accepts a Certificate object", function() {
		it("does not throw", function() {
			expect(function() {
				new APNCertificate(cert);
			}).to.not.throw(Error);
		});
	});

	describe("throws", function() {
		it("missing public key", function() {
			delete cert.publicKey;

			expect(function() {
				new APNCertificate(cert);
			}).to.throw("certificate object is invalid");
		});

		it("missing validity", function() {
			delete cert.validity;

			expect(function() {
				new APNCertificate(cert);
			}).to.throw("certificate object is invalid");
		});

		it("missing subject", function() {
			delete cert.subject;

			expect(function() {
				new APNCertificate(cert);
			}).to.throw("certificate object is invalid");
		});
	});

	describe("key", function() {
		it("returns an APNKey", function() {
			expect(new APNCertificate(cert).key()).to.be.an.instanceof(APNKey);
		});

		it("returns the the certificates public key", function() {
			expect(new APNCertificate(cert).key().fingerprint()).to.equal("2d594c9861227dd22ba5ae37cc9354e9117a804d");
		});
	});

	describe("validity", function() {
		it("returns an object containing notBefore", function() {
			expect(new APNCertificate(cert).validity())
				.to.have.property("notBefore")
				.and
				.to.eql(new Date("2014-12-16T23:27:18"));
		});

		it("returns an object containing notAfter", function() {
			expect(new APNCertificate(cert).validity())
				.to.have.property("notAfter")
				.and
				.to.eql(new Date("2024-12-16T23:27:18"));
		});
	});

	describe("environment", function() {
		describe("development certificate", function() {
			it("sandbox flag", function() {
				expect(new APNCertificate(cert).environment().sandbox).to.be.true;
			});

			it("production flag", function() {
				expect(new APNCertificate(cert).environment().production).to.be.false;
			});
		});

		describe("production certificate", function() {
			var productionCertPem, productionCert;
			before(function() {
				productionCertPem = fs.readFileSync("test/credentials/support/certProduction.pem");
			});
			
			beforeEach(function() {
				productionCert = forge.pki.certificateFromPem(productionCertPem.toString());
			});

			it("sandbox flag", function() {
				expect(new APNCertificate(productionCert).environment().sandbox).to.be.false;
			});

			it("production flag", function() {
				expect(new APNCertificate(productionCert).environment().production).to.be.true;
			});
		});
	});
});