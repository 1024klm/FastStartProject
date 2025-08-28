export const rubyStack = {
  files: {
    'main.rb': `#!/usr/bin/env ruby
# frozen_string_literal: true

# PROJECT_NAME - A new Ruby project

require 'bundler/setup'
require 'dotenv/load'

class App
  VERSION = '0.1.0'
  NAME = 'PROJECT_NAME'
  
  def initialize
    @debug = ENV.fetch('DEBUG', 'false').downcase == 'true'
  end
  
  def run
    puts "🚀 #{NAME} v#{VERSION} - Ready to ship!"
    
    # Delete this and start coding
    # Remember: Ship > Perfect
  end
  
  private
  
  attr_reader :debug
end

# Run if called directly
if __FILE__ == $0
  app = App.new
  app.run
end`,
    'Gemfile': `# frozen_string_literal: true

source 'https://rubygems.org'

ruby '>= 2.7.0'

# Core gems
gem 'dotenv', '~> 2.8'

# Development & Test
group :development, :test do
  gem 'rspec', '~> 3.12'
  gem 'rubocop', '~> 1.50'
  gem 'pry', '~> 0.14'
end

# Common gems (uncomment as needed)
# gem 'sinatra', '~> 3.0'
# gem 'rack', '~> 3.0'
# gem 'httparty', '~> 0.21'
# gem 'activerecord', '~> 7.0'
# gem 'pg', '~> 1.5'
# gem 'redis', '~> 5.0'`,
    '.rubocop.yml': `AllCops:
  TargetRubyVersion: 2.7
  NewCops: enable
  Exclude:
    - 'vendor/**/*'
    - 'spec/**/*'
    - 'bin/*'

Style/Documentation:
  Enabled: false

Style/FrozenStringLiteralComment:
  Enabled: true

Layout/IndentationWidth:
  Width: 2

Metrics/MethodLength:
  Max: 20

Metrics/BlockLength:
  Exclude:
    - 'spec/**/*'

Layout/LineLength:
  Max: 100`,
    '.env.example': `# Environment variables
DEBUG=false
LOG_LEVEL=info

# Add your env vars here
# API_KEY=your_api_key_here
# DATABASE_URL=postgres://localhost/PROJECT_NAME`,
    'Rakefile': `# frozen_string_literal: true

require 'rspec/core/rake_task'
require 'rubocop/rake_task'

RSpec::Core::RakeTask.new(:spec)
RuboCop::RakeTask.new

task default: %i[rubocop spec]

desc 'Run the application'
task :run do
  ruby 'main.rb'
end`,
    'spec/spec_helper.rb': `# frozen_string_literal: true

require 'bundler/setup'
Bundler.require(:default, :test)

RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
  config.filter_run_when_matching :focus
  config.disable_monkey_patching!
  config.warnings = true

  if config.files_to_run.one?
    config.default_formatter = 'doc'
  end

  config.order = :random
  Kernel.srand config.seed
end`,
    'spec/main_spec.rb': `# frozen_string_literal: true

require_relative '../main'

RSpec.describe App do
  describe '#initialize' do
    it 'creates a new app instance' do
      expect { described_class.new }.not_to raise_error
    end
  end
  
  # Add more tests as you develop
end`,
    '.ruby-version': `3.2.0`
  },
  gitignore: `# Ruby
*.gem
*.rbc
/.config
/coverage/
/InstalledFiles
/pkg/
/spec/reports/
/spec/examples.txt
/test/tmp/
/test/version_tmp/
/tmp/

# Bundler
.bundle/
vendor/bundle
/lib/bundler/man/
Gemfile.lock
.ruby-version
.ruby-gemset
.rvmrc

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
/log/

# Database
*.sqlite3
*.db

# Documentation
/.yardoc/
/_yardoc/
/doc/
/rdoc/`,
  commands: [
    'bundle install',
    'ruby main.rb'
  ]
};