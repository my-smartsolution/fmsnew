const CommonValidator = require("../../middleware/validators/CommonValidators");
const {
  invoices,
  bookings,
  customers,
  border_Routes,
  tracking,
  tackinghistory,
} = require("../../model");
const trackingHistory = require("../../model/trackingHistory");
invoices.belongsTo(bookings, { foreignKey: "booking_id" });
// bookings.belongsTo(tracking, { foreignKey: "tracking_id" });

invoices.belongsTo(customers, { foreignKey: "customer_id" });
invoices.belongsTo(border_Routes, { foreignKey: "route_id" });
bookings.belongsTo(tackinghistory, {
  foreignKey: "tracking_id",
});
tackinghistory.belongsTo(tracking, {
  foreignKey: "tracking_stage_id",
});
const createInvoice = async (req, res) => {
  try {
    const {
      customerCreditBalance,
      booking_id,
      new_booking_id,
      date,
      customer_id,
      customerCreditLimit,
      customerCreditUsed,
      client_id,
      route_id,
      route_fare,
      all_border_fare,
      total_ammount,
      driver_id,
      document_path,
      payment_status,
      remarkOnDriver,
      tracking_id,
      booking_status,
      ammount_to_driver,
      customer,
      client,
      driver,
      border_Route,
      trackingsses,
      penalty_ammount,
      driver_remark,
    } = req.body;

    const invoiceData = {
      customer_id: customer_id,
      booking_id: booking_id,
      totalAmount: total_ammount,
      payToDriver: ammount_to_driver,
      consignmentDocumentStatus: req.file.filename,
      route_id: route_id,
    };
    const newInvoice = await invoices.create(invoiceData);

    // Update the corresponding booking's invoice_status
    await bookings.update(
      { invoice_status: "generated" }, // Set the desired invoice_status
      { where: { booking_id: booking_id } }
    );

    res.status(201).json(newInvoice);
  } catch (error) {
    // HandleDbErrors(error, res);
    console.error("Error creating user:", error);
    // res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getInvoices = async (req, res) => {
  try {
    // Retrieve all invoices with associated data from the Booking model
    const allInvoices = await invoices.findAll({
      include: [
        {
          model: bookings,
          include: [
            {
              model: tackinghistory,
              include: [{ model: tracking }],
            },
          ],
        },
        { model: customers },
        { model: border_Routes },
      ],
    });

    // Respond with the list of invoices
    res.status(200).json(allInvoices);
  } catch (error) {
    // Handle errors appropriately
    console.error("Error retrieving invoices:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { createInvoice, getInvoices };
