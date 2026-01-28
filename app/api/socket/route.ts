import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/next';
import ioHandler from '@/lib/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  ioHandler(req, res);
}
