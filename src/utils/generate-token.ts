import jwt from "jsonwebtoken"

export const generateToken = async (id: string): Promise<string> => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET as string, { expiresIn: '7D' })
}