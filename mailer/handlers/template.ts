export const getEmailTemplate = (
  title: string,
  content: string,
  buttonText?: string,
  buttonUrl?: string
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #000000;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #000000; border: 1px solid #424242; border-radius: 8px;">
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0 0 20px 0; color: #FFC700; font-size: 28px; font-weight: bold;">Skal</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: bold;">${title}</h2>
              <div style="color: #ffffff; font-size: 16px; line-height: 1.6;">
                ${content}
              </div>
            </td>
          </tr>
          ${
            buttonText && buttonUrl
              ? `
          <tr>
            <td align="center" style="padding: 0 30px 40px 30px;">
              <a href="${buttonUrl}" style="display: inline-block; padding: 14px 28px; background-color: #FFC700; color: #000000; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">${buttonText}</a>
            </td>
          </tr>
        `
              : ""
          }
          <tr>
            <td style="padding: 30px; border-top: 1px solid #424242; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 14px;">
                &copy; ${new Date().getFullYear()} Skal. All rights reserved.
              </p>
              <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                If you didn&apos;t request this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
