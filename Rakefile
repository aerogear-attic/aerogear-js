require 'rake'
require 'pdoc'

desc "Builds the documentation"
task :build_doc do
  hash = `git show-ref --hash HEAD`.chomp[0..6]

  PDoc.run({
    :source_files => Dir[File.join("src", "**", "*.js")],
    :destination => "docs",
    :syntax_highlighter => :none,
    :markdown_parser => :bluecloth,
    :src_code_href => proc { |obj|
        "https://github.com/aerogear/aerogear-js/blob/#{hash}/#{obj.file}#L#{obj.line_number}"
      },
    :pretty_urls => false,
    :bust_cache => true,
    :name => 'AeroGear JavaScript Library',
    :short_name => 'AeroGear.js',
    :home_url => 'http://aerogear.org',
    :doc_url => 'http://aerogear.org/docs',
    :version => "1.0.0.Alpha",
    :copyright_notice => 'Add license info here' 
  })
end

desc "Empties output directory"
task :remove_doc do
  rm_rf Dir.glob(File.join(docs, "*"))
end

desc "Empties the output directory and builds the documentation."
task :doc => [:remove_doc, :build_doc]