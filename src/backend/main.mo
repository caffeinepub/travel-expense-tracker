import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Debug "mo:core/Debug";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  include MixinStorage();

  type Trip = {
    id : Text;
    name : Text;
    startDate : Text;
    endDate : Text;
    description : ?Text;
  };

  module Trip {
    public func compare(trip1 : Trip, trip2 : Trip) : Order.Order {
      Text.compare(trip1.name, trip2.name);
    };
  };

  type ExpenseCategory = {
    #Travel;
    #Food;
    #Hotel;
    #Other;
  };

  type Expense = {
    id : Text;
    title : Text;
    amount : Float;
    category : ExpenseCategory;
    expenseDate : Text;
    billImage : Storage.ExternalBlob;
    notes : ?Text;
    tripId : Text;
  };

  module Expense {
    public func compare(expense1 : Expense, expense2 : Expense) : Order.Order {
      switch (Float.compare(expense1.amount, expense2.amount)) {
        case (#equal) { Text.compare(expense1.id, expense2.id) };
        case (order) { order };
      };
    };

    public func compareByDate(expense1 : Expense, expense2 : Expense) : Order.Order {
      Text.compare(expense1.expenseDate, expense2.expenseDate);
    };
  };

  let tripsMap = Map.empty<Text, Trip>();
  let expenseMap = Map.empty<Text, Expense>();

  public shared ({ caller }) func createTrip(name : Text, startDate : Text, endDate : Text, description : ?Text) : async Trip {
    let tripId = name.concat(Time.now().toText());
    let trip : Trip = {
      id = tripId;
      name;
      startDate;
      endDate;
      description;
    };
    tripsMap.add(tripId, trip);
    trip;
  };

  public query ({ caller }) func getAllTrips() : async [Trip] {
    tripsMap.values().toArray().sort();
  };

  public query ({ caller }) func getTripById(tripId : Text) : async Trip {
    switch (tripsMap.get(tripId)) {
      case (null) { Runtime.trap("Trip does not exist") };
      case (?trip) { trip };
    };
  };

  public shared ({ caller }) func updateTrip(tripId : Text, name : Text, startDate : Text, endDate : Text, description : ?Text) : async () {
    switch (tripsMap.get(tripId)) {
      case (null) { Runtime.trap("Trip does not exist") };
      case (?_) {
        let updatedTrip : Trip = {
          id = tripId;
          name;
          startDate;
          endDate;
          description;
        };
        tripsMap.add(tripId, updatedTrip);
      };
    };
  };

  public shared ({ caller }) func deleteTrip(tripId : Text) : async () {
    switch (tripsMap.get(tripId)) {
      case (null) { Runtime.trap("Trip does not exist") };
      case (?_) { tripsMap.remove(tripId) };
    };
  };

  public shared ({ caller }) func addExpense(title : Text, amount : Float, category : ExpenseCategory, expenseDate : Text, billImage : Storage.ExternalBlob, notes : ?Text, tripId : Text) : async Expense {
    let expenseId = title.concat(Time.now().toText());
    let expense : Expense = {
      id = expenseId;
      title;
      amount;
      category;
      expenseDate;
      billImage;
      notes;
      tripId;
    };
    expenseMap.add(expenseId, expense);
    expense;
  };

  public query ({ caller }) func getExpensesByTripId(tripId : Text) : async [Expense] {
    expenseMap.values().toArray().filter(func(expense) { expense.tripId == tripId }).sort(Expense.compareByDate);
  };

  public shared ({ caller }) func updateExpense(expenseId : Text, title : Text, amount : Float, category : ExpenseCategory, expenseDate : Text, billImage : Storage.ExternalBlob, notes : ?Text, tripId : Text) : async () {
    switch (expenseMap.get(expenseId)) {
      case (null) { Runtime.trap("Expense does not exist") };
      case (?_) {
        let updatedExpense : Expense = {
          id = expenseId;
          title;
          amount;
          category;
          expenseDate;
          billImage;
          notes;
          tripId;
        };
        expenseMap.add(expenseId, updatedExpense);
      };
    };
  };

  public shared ({ caller }) func deleteExpense(expenseId : Text) : async () {
    switch (expenseMap.get(expenseId)) {
      case (null) { Runtime.trap("Expense does not exist") };
      case (?_) { expenseMap.remove(expenseId) };
    };
  };

  public shared ({ caller }) func uploadBillImage(file : Storage.ExternalBlob) : async Storage.ExternalBlob {
    file;
  };

  // Debug
  public query ({ caller }) func debugPrintTripsMap() : async () {
    Debug.print(debug_show (tripsMap));
  };
};
