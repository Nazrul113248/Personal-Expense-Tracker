import { Router, Response } from 'express';
import { db, DBTransaction } from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const VALID_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Salary',
  'Other',
];

// POST /api/transactions - Add Transaction
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, amount, type, category, description, date } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    if (type !== 'Income' && type !== 'Expense') {
      res.status(400).json({ message: 'Type must be either Income or Expense' });
      return;
    }

    if (!VALID_CATEGORIES.includes(category)) {
      res.status(400).json({ message: `Invalid category. Allowed: ${VALID_CATEGORIES.join(', ')}` });
      return;
    }

    if (!date) {
      res.status(400).json({ message: 'Date is required' });
      return;
    }

    const newTransaction: DBTransaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: req.userId!,
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      description: description ? String(description).trim() : '',
      date,
      createdAt: new Date().toISOString(),
    };

    const created = await db.createTransaction(newTransaction);
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: created,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }
});

// GET /api/transactions - View All Transactions
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let transactions = await db.getTransactionsByUser(req.userId!);

    const { type, category, search, sortBy } = req.query;

    // Filter by Type
    if (type && type !== 'All') {
      transactions = transactions.filter((t) => t.type === type);
    }

    // Filter by Category
    if (category && category !== 'All') {
      transactions = transactions.filter((t) => t.category === category);
    }

    // Search by title or description
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      transactions = transactions.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    // Sort
    const sort = (sortBy as string) || 'date_desc';
    transactions.sort((a, b) => {
      if (sort === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === 'amount_desc') return b.amount - a.amount;
      if (sort === 'amount_asc') return a.amount - b.amount;
      // Default: date_desc
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    res.json({
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve transactions' });
  }
});

// GET /api/transactions/:id - View Single Transaction
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const transaction = await db.findTransactionById(req.params.id, req.userId!);
    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving transaction' });
  }
});

// PUT /api/transactions/:id - Edit Transaction
router.put('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, amount, type, category, description, date } = req.body;

    const updates: Partial<DBTransaction> = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        res.status(400).json({ message: 'Title cannot be empty' });
        return;
      }
      updates.title = title.trim();
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ message: 'Amount must be a positive number' });
        return;
      }
      updates.amount = parsedAmount;
    }

    if (type !== undefined) {
      if (type !== 'Income' && type !== 'Expense') {
        res.status(400).json({ message: 'Type must be either Income or Expense' });
        return;
      }
      updates.type = type;
    }

    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        res.status(400).json({ message: `Invalid category` });
        return;
      }
      updates.category = category;
    }

    if (description !== undefined) {
      updates.description = String(description).trim();
    }

    if (date !== undefined) {
      if (!date) {
        res.status(400).json({ message: 'Date cannot be empty' });
        return;
      }
      updates.date = date;
    }

    const updated = await db.updateTransaction(req.params.id, req.userId!, updates);
    if (!updated) {
      res.status(404).json({ message: 'Transaction not found or unauthorized' });
      return;
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction: updated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction' });
  }
});

// DELETE /api/transactions/:id - Delete Transaction
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const deleted = await db.deleteTransaction(req.params.id, req.userId!);
    if (!deleted) {
      res.status(404).json({ message: 'Transaction not found or unauthorized' });
      return;
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction' });
  }
});

export default router;
