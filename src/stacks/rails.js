export const railsStack = {
  files: {
    'Gemfile': `source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby ">= 3.0.0"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 7.1.0"

# The original asset pipeline for Rails
gem "sprockets-rails"

# Use postgresql as the database for Active Record
gem "pg", "~> 1.1"

# Use the Puma web server
gem "puma", "~> 6.0"

# Bundle and transpile JavaScript
gem "jsbundling-rails"

# Hotwire's SPA-like page accelerator
gem "turbo-rails"

# Hotwire's modest JavaScript framework
gem "stimulus-rails"

# Bundle and process CSS
gem "cssbundling-rails"

# Build JSON APIs with ease
gem "jbuilder"

# Use Redis adapter to run Action Cable in production
gem "redis", "~> 5.0"

# Use Kredis to get higher-level data types in Redis
# gem "kredis"

# Use Active Model has_secure_password
gem "bcrypt", "~> 3.1.7"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ mingw mswin x64_mingw jruby ]

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Use Sass to process CSS
# gem "sassc-rails"

# Use Active Storage variants
gem "image_processing", "~> 1.2"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri mingw x64_mingw ]
  gem "rspec-rails", "~> 6.0"
  gem "factory_bot_rails"
  gem "faker"
end

group :development do
  # Use console on exceptions pages
  gem "web-console"
  
  # Add speed badges
  gem "rack-mini-profiler"
  
  # Speed up commands on slow machines / big apps
  gem "spring"
  
  gem "rubocop-rails", require: false
  gem "annotate"
end

group :test do
  # Use system testing
  gem "capybara"
  gem "selenium-webdriver"
  gem "webdrivers"
  gem "shoulda-matchers"
  gem "database_cleaner-active_record"
end`,
    'config/database.yml': `default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: PROJECT_NAME_development
  
test:
  <<: *default
  database: PROJECT_NAME_test

production:
  <<: *default
  database: PROJECT_NAME_production
  username: PROJECT_NAME
  password: <%= ENV["PROJECT_NAME_DATABASE_PASSWORD"] %>`,
    '.ruby-version': `3.2.0`,
    '.env.example': `# Rails environment
RAILS_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://localhost/PROJECT_NAME_development

# Redis
REDIS_URL=redis://localhost:6379/1

# Secret keys (generate with: rails secret)
SECRET_KEY_BASE=your-secret-key-here

# Mail (uncomment and configure)
# SMTP_ADDRESS=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-password

# External APIs
# API_KEY=your-api-key-here`,
    'config/routes.rb': `Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "home#index"
  
  # API namespace
  namespace :api do
    namespace :v1 do
      resources :items, only: [:index, :show, :create, :update, :destroy]
    end
  end
  
  # Example resource routes (uncomment and modify as needed)
  # resources :posts do
  #   resources :comments
  # end
  
  # resources :users do
  #   member do
  #     get :profile
  #   end
  # end
end`,
    'app/controllers/home_controller.rb': `class HomeController < ApplicationController
  def index
    render json: {
      message: "🚀 PROJECT_NAME Rails API",
      version: "0.1.0",
      status: "ready to ship!"
    }
  end
end`,
    'app/controllers/api/v1/base_controller.rb': `module Api
  module V1
    class BaseController < ApplicationController
      # Skip CSRF protection for API endpoints
      protect_from_forgery with: :null_session
      
      # API authentication (implement as needed)
      # before_action :authenticate_api_user!
      
      # Handle common errors
      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
      
      private
      
      def not_found
        render json: { error: "Resource not found" }, status: :not_found
      end
      
      def unprocessable_entity(exception)
        render json: { errors: exception.record.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end
end`,
    'app/controllers/api/v1/items_controller.rb': `module Api
  module V1
    class ItemsController < BaseController
      before_action :set_item, only: [:show, :update, :destroy]
      
      # GET /api/v1/items
      def index
        @items = Item.all
        render json: @items
      end
      
      # GET /api/v1/items/:id
      def show
        render json: @item
      end
      
      # POST /api/v1/items
      def create
        @item = Item.new(item_params)
        
        if @item.save
          render json: @item, status: :created
        else
          render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      # PATCH/PUT /api/v1/items/:id
      def update
        if @item.update(item_params)
          render json: @item
        else
          render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
        end
      end
      
      # DELETE /api/v1/items/:id
      def destroy
        @item.destroy
        head :no_content
      end
      
      private
      
      def set_item
        @item = Item.find(params[:id])
      end
      
      def item_params
        params.require(:item).permit(:name, :description, :price)
      end
    end
  end
end`,
    'app/models/application_record.rb': `class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
end`,
    'app/models/item.rb': `class Item < ApplicationRecord
  # Validations
  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  
  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :expensive, -> { where("price > ?", 100) }
  
  # Callbacks
  before_save :normalize_name
  
  private
  
  def normalize_name
    self.name = name.strip.capitalize if name.present?
  end
end`,
    'db/migrate/001_create_items.rb': `class CreateItems < ActiveRecord::Migration[7.1]
  def change
    create_table :items do |t|
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      
      t.timestamps
    end
    
    add_index :items, :name
    add_index :items, :created_at
  end
end`,
    'spec/rails_helper.rb': `require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'

abort("The Rails environment is running in production mode!") if Rails.env.production?

require 'rspec/rails'

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  config.fixture_path = Rails.root.join('spec/fixtures')
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
  
  # Include FactoryBot methods
  config.include FactoryBot::Syntax::Methods
  
  # Database cleaner config
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end
  
  config.around(:each) do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end
end

# Shoulda Matchers config
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end`,
    'spec/models/item_spec.rb': `require 'rails_helper'

RSpec.describe Item, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_length_of(:name).is_at_least(2).is_at_most(100) }
    it { should validate_presence_of(:price) }
    it { should validate_numericality_of(:price).is_greater_than_or_equal_to(0) }
  end
  
  describe 'scopes' do
    describe '.recent' do
      it 'returns items ordered by created_at desc' do
        old_item = Item.create!(name: 'Old', price: 10, created_at: 1.day.ago)
        new_item = Item.create!(name: 'New', price: 20, created_at: 1.hour.ago)
        
        expect(Item.recent).to eq([new_item, old_item])
      end
    end
  end
  
  describe 'callbacks' do
    describe '#normalize_name' do
      it 'capitalizes and strips the name before saving' do
        item = Item.create!(name: '  test item  ', price: 10)
        expect(item.name).to eq('Test item')
      end
    end
  end
end`,
    'spec/controllers/api/v1/items_controller_spec.rb': `require 'rails_helper'

RSpec.describe Api::V1::ItemsController, type: :controller do
  describe 'GET #index' do
    it 'returns a success response' do
      get :index
      expect(response).to be_successful
    end
    
    it 'returns all items' do
      items = create_list(:item, 3)
      get :index
      expect(JSON.parse(response.body).size).to eq(3)
    end
  end
  
  describe 'POST #create' do
    context 'with valid params' do
      let(:valid_attributes) { { name: 'Test Item', price: 99.99 } }
      
      it 'creates a new Item' do
        expect {
          post :create, params: { item: valid_attributes }
        }.to change(Item, :count).by(1)
      end
      
      it 'returns a created status' do
        post :create, params: { item: valid_attributes }
        expect(response).to have_http_status(:created)
      end
    end
    
    context 'with invalid params' do
      let(:invalid_attributes) { { name: '', price: -1 } }
      
      it 'does not create a new Item' do
        expect {
          post :create, params: { item: invalid_attributes }
        }.to change(Item, :count).by(0)
      end
      
      it 'returns an unprocessable entity status' do
        post :create, params: { item: invalid_attributes }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end`,
    'spec/factories/items.rb': `FactoryBot.define do
  factory :item do
    name { Faker::Commerce.product_name }
    description { Faker::Lorem.paragraph }
    price { Faker::Commerce.price(range: 0.01..1000.0) }
    
    trait :expensive do
      price { Faker::Commerce.price(range: 100.0..1000.0) }
    end
    
    trait :cheap do
      price { Faker::Commerce.price(range: 0.01..10.0) }
    end
  end
end`,
    'Procfile': `web: bundle exec puma -C config/puma.rb
worker: bundle exec sidekiq -C config/sidekiq.yml
release: bundle exec rails db:migrate`,
    'docker-compose.yml': `version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  web:
    build: .
    command: bundle exec rails s -b '0.0.0.0'
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
    environment:
      DATABASE_URL: postgresql://postgres:password@db/PROJECT_NAME_development
      REDIS_URL: redis://redis:6379/1
      RAILS_ENV: development

volumes:
  postgres_data:`,
    'Dockerfile': `FROM ruby:3.2.0

RUN apt-get update -qq && apt-get install -y nodejs postgresql-client

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]`
  },
  gitignore: `# Ruby on Rails
*.rbc
capybara-*.html
.rspec
/db/*.sqlite3
/db/*.sqlite3-journal
/db/*.sqlite3-[0-9]*
/public/system
/coverage/
/spec/tmp
*.orig
rerun.txt
pickle-email-*.html

# Ignore all logfiles and tempfiles.
/log/*
/tmp/*
!/log/.keep
!/tmp/.keep

# Ignore pidfiles, but keep the directory.
/tmp/pids/*
!/tmp/pids/
!/tmp/pids/.keep

# Ignore uploaded files in development.
/storage/*
!/storage/.keep
/tmp/storage/*
!/tmp/storage/
!/tmp/storage/.keep

/public/assets

# Ignore master key for decrypting credentials and more.
/config/master.key

/public/packs
/public/packs-test
/node_modules
/yarn-error.log
yarn-debug.log*
.yarn-integrity

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

# Bundler
.bundle
vendor/bundle

# Spring
/spring/*.pid

# Byebug
.byebug_history`,
  commands: [
    'bundle install',
    'rails db:create db:migrate',
    'rails server'
  ]
};