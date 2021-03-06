DB.create_table? :payees do
  uuid :uuid, primary_key: true
  foreign_key :user_uuid, :users, null: false, type: 'uuid'
  String :name, null: false, unique: true
  DateTime :created_at, null: false
  DateTime :updated_at, null: false
end

class Payee < Sequel::Model
  many_to_one :user, key: :user_uuid
  one_to_many :transactions, key: :payee_uuid
  one_to_many :locations, key: :payee_uuid
end
