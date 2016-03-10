/* eslint-disable max-nested-callbacks,no-regex-spaces */

'use strict';

const cli = require('../lib/cli'),
  mockStream = require('mock-utf8-stream');

describe('KssBuilderHandlebars builder (default)', function() {
  before(function() {
    let stdout = new mockStream.MockWritableStream(),
      stderr = new mockStream.MockWritableStream();

    stdout.startCapture();
    stderr.startCapture();

    this.files = {};

    return cli({
      stdout: stdout,
      stderr: stderr,
      argv: ['node', 'bin/kss-node', 'test/fixtures/with-include', 'test/output/nested', '--builder', 'test/fixtures/builder', '--helpers', 'test/fixtures/builder/helpers']
    }).catch(function(error) {
      // Pass the error on to the next .then().
      return error;
    }).then(result => {
      expect(result).to.not.be.instanceOf(Error);
      this.stdout = stdout.capturedData;
      return Promise.all(
        [
          'index',
          'section-2',
          'section-3'
        ].map(fileName => {
          return fs.readFileAsync(path.join(__dirname, 'output', 'nested', fileName + '.html'), 'utf8').then(data => {
            this.files[fileName] = data;
          });
        })
      );
    });
  });

  describe('given --helpers option', function() {
    it('should load additional Handlebars helpers', function() {
      expect(this.files.index).to.include('Handlebars helper loaded into template!');
    });
  });

  describe('KssBuilderBaseHandlebar\'s Handlebars helpers', function() {
    it('should load Handlebars helper: {{{markup}}}', function() {
      expect(this.files['section-2']).to.include('Handlebars markup Helper: pseudo-class-hover');
      expect(this.files['section-2']).to.include('Handlebars markup Helper: stars-given<');
      expect(this.files['section-2']).to.include('Handlebars markup Helper: stars-given pseudo-class-hover');
      expect(this.files['section-2']).to.include('Handlebars markup Helper: disabled');
      expect(this.files['section-2']).to.include('Nested Handlebars partial part 1:part 2 of Nested Handlebars partial');
      expect(this.files['section-2']).to.include('Test of Handlebars partial data');
    });
  });

  describe('builder\'s Handlebars helpers', function() {
    it('should load Handlebars helper: {{section [arg]}}', function() {
      expect(this.files['section-3']).to.include('Handlebars Section Helper Test 3');
      expect(this.files['section-3']).to.include('Section 3 has been successfully loaded.');
    });

    it('should load Handlebars helper: {{eachSection [arg]}}', function() {
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper Test 2.1.3');
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper Test 2.1.4');
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper: #each modifiers: :hover');
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper: #each modifiers: .stars-given<');
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper: #each modifiers: .stars-given:hover');
      expect(this.files['section-2']).to.include('Handlebars eachSection Helper: #each modifiers: .disabled');
    });
  });
});
