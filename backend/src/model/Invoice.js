module.exports = function (sequelize, DataTypes) {
  const Invoice = sequelize.define(
    "invoices",
    {
      invoice_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "customers",
          key: "customer_id",
        },
      },
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      booking_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "bookings",
          key: "booking_id",
        },
      },
      route_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "border__routes",
          key: "route_id",
        },
      },
      invoiceDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      issueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      received: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      balanceAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      payToDriver: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // paidToDriver: {
      //   type: DataTypes.DECIMAL(10, 2),
      //   allowNull: false,
      // },
      driverBalance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      documentStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trackingStatusPopup: {
        type: DataTypes.STRING,
      },
      consignmentDocumentStatus: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  return Invoice;
};
