Core Features to Implement
1. The Dashboard (Real-Time View)
Display a list of items with their Name, Price, and Live Stock Count.
The stock count must update across all open browser tabs instantly when any user makes a reservation or a purchase.
2. The "Atomic Reservation" System
Users can click "Reserve" on an item. This should temporarily decrease the available stock by 1.
Constraint: You must prevent "Overselling." If 100 users click "Reserve" at the exact same millisecond for the last 1 item, only 1 user should succeed.
The reservation lasts for 60 seconds.
3. The "Stock Recovery" Mechanism
If a user does not click "Complete Purchase" within the 60-second window, the reservation expires.
The system must automatically return that 1 unit back to the "Available Stock" and notify all connected clients via WebSockets.

4. The "Purchase" Flow
Users can only purchase an item they have currently reserved.
Upon purchase, the stock is permanently deducted.
5.  The "Merch Drop" API (No Admin UI Required)
We do not need a visual dashboard for admins. However, we need a robust API endpoint to initialize a new merch drop.
The Task: Create an API to create a new "Drop" (e.g., "Air Jordan 1 - 100 units").
What we are looking for: How do you structure the data? Do you handle timestamps (when the drop starts)? How do you initialize the stock?
Drop Table is implied
6. The Feature Addition: "Drop Activity Feed."
New Requirement: On the main dashboard, each Merch Drop must display the top 3 most recent successful purchasers (displaying their usernames) directly on the product card.
The Data: You will need a Users table and a Purchases table.
The Goal: When the frontend requests the list of active Merch Drops, the API response must include the drop details plus the nested list of the 3 latest purchasers for each drop.

implement these features one by one.. please i will push one by one fetures then you will check and confirm it then we will move to the next feature ok?