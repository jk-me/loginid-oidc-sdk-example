require("dotenv").config();
const app = require('../app.js')

const chai = require('chai')
const chaiHttp = require('chai-http');
const expect = chai.expect

chai.use(chaiHttp);

describe('Root page', function(){
  it('is working', done => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      })
  })
})

describe('Login route', function(){
  it('redirects', done => {
    chai.request(app)
      .get('/login')
      .end((err, res) => {
        expect(res).to.redirectTo(`https://sandbox.api.auth.asliri.id/oidc/${process.env.LOGINID_ORG_ID}`)
        done();
      })
  })
})
