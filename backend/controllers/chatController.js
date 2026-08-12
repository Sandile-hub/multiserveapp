const db = require("../config/database");

// ======================================
// GET PROVIDER CONVERSATIONS
// ======================================

exports.getProviderChats = async (req, res) => {

  try {

    const provider_id = req.user.id;

    const [conversations] = await db.query(
      `
      SELECT

        conversations.id,

        users.id AS customer_id,

        users.full_name,

        (
          SELECT message
          FROM messages
          WHERE conversation_id = conversations.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_message,

        (
          SELECT created_at
          FROM messages
          WHERE conversation_id = conversations.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_message_time

      FROM conversations

      JOIN users
      ON conversations.customer_id = users.id

      WHERE conversations.provider_id = ?

      ORDER BY last_message_time DESC
      `,
      [provider_id]
    );

    res.status(200).json(conversations);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ======================================
// GET CUSTOMER CONVERSATIONS
// ======================================

exports.getCustomerChats = async (req, res) => {

  try {

    const customer_id = req.user.id;

    const [conversations] = await db.query(
      `
      SELECT

        conversations.id,

        users.id AS provider_id,

        users.full_name AS provider_name,

        businesses.business_name,

        (
          SELECT message
          FROM messages
          WHERE conversation_id = conversations.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_message,

        (
          SELECT created_at
          FROM messages
          WHERE conversation_id = conversations.id
          ORDER BY created_at DESC
          LIMIT 1
        ) AS last_time

      FROM conversations

      JOIN users
      ON conversations.provider_id = users.id

      LEFT JOIN businesses
      ON businesses.provider_id = users.id

      WHERE conversations.customer_id = ?

      ORDER BY last_time DESC
      `,
      [customer_id]
    );

    res.status(200).json(conversations);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ======================================
// GET CHAT MESSAGES
// ======================================

exports.getMessages = async (req, res) => {

  try {

    const { conversation_id } = req.params;

    const [messages] = await db.query(
      `
      SELECT *
      FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
      `,
      [conversation_id]
    );

    res.status(200).json(messages);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ======================================
// SEND MESSAGE
// ======================================

exports.sendMessage = async (req, res) => {

  try {

    const sender_id = req.user.id;

    const {
      conversation_id,
      receiver_id,
      message,
    } = req.body;

    const [result] = await db.query(
      `
      INSERT INTO messages
      (
        conversation_id,
        sender_id,
        receiver_id,
        message
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        conversation_id,
        sender_id,
        receiver_id,
        message,
      ]
    );

    const [newMessage] = await db.query(
      `
      SELECT *
      FROM messages
      WHERE id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(newMessage[0]);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};