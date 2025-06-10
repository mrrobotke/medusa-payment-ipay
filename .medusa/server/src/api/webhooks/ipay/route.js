"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
async function POST(req, res) {
    try {
        const webhookData = req.body;
        const { id, status, txncd, mc, ivm, qwh, afd, poi, uyt, ifd, agt, p1, p2, p3, p4, msisdn_id, msisdn_idnum } = webhookData;
        console.log("iPay webhook received:", {
            id,
            status,
            txncd,
            mc,
            timestamp: new Date().toISOString()
        });
        // Update payment session based on the callback
        // This is where you would typically update the payment status in your database
        // Process the payment status
        switch (status) {
            case "aei7p7yrx4ae34": // Success
                console.log(`Payment ${id} completed successfully`);
                // Update payment to authorized/captured
                break;
            case "bdi6p2yy76etrs": // Pending
                console.log(`Payment ${id} is pending`);
                // Keep payment in pending state
                break;
            case "fe2707etr5s4wq": // Failed
            case "dtfi4p7yty45wq": // Less amount
            case "cr5i3pgy9867e1": // Used code
                console.log(`Payment ${id} failed with status: ${status}`);
                // Mark payment as failed
                break;
            default:
                console.log(`Unknown payment status: ${status}`);
        }
        res.status(200).json({
            message: "Webhook processed successfully",
            received: true
        });
    }
    catch (error) {
        console.error("Error processing iPay webhook:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
async function GET(req, res) {
    try {
        // Handle GET callback (when crl=0)
        const queryData = req.query;
        const { id, status, txncd, mc, ivm, qwh, afd, poi, uyt, ifd, agt, p1, p2, p3, p4, msisdn_id, msisdn_idnum } = queryData;
        console.log("iPay GET callback received:", {
            id,
            status,
            txncd,
            mc,
            timestamp: new Date().toISOString()
        });
        // Process similar to POST
        switch (status) {
            case "aei7p7yrx4ae34": // Success
                console.log(`Payment ${id} completed successfully`);
                break;
            case "bdi6p2yy76etrs": // Pending
                console.log(`Payment ${id} is pending`);
                break;
            case "fe2707etr5s4wq": // Failed
            case "dtfi4p7yty45wq": // Less amount
            case "cr5i3pgy9867e1": // Used code
                console.log(`Payment ${id} failed with status: ${status}`);
                break;
            default:
                console.log(`Unknown payment status: ${status}`);
        }
        // Redirect to success/failure page
        const redirectUrl = status === "aei7p7yrx4ae34"
            ? "/payment/success"
            : "/payment/failed";
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error("Error processing iPay GET callback:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3dlYmhvb2tzL2lwYXkvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFzQkEsb0JBcUVDO0FBRUQsa0JBa0VDO0FBeklNLEtBQUssVUFBVSxJQUFJLENBQ3hCLEdBQWtCLEVBQ2xCLEdBQW1CO0lBRW5CLElBQUksQ0FBQztRQUNILE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUF1QixDQUFBO1FBQy9DLE1BQU0sRUFDSixFQUFFLEVBQ0YsTUFBTSxFQUNOLEtBQUssRUFDTCxFQUFFLEVBQ0YsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEdBQUcsRUFDSCxHQUFHLEVBQ0gsR0FBRyxFQUNILEVBQUUsRUFDRixFQUFFLEVBQ0YsRUFBRSxFQUNGLEVBQUUsRUFDRixTQUFTLEVBQ1QsWUFBWSxFQUNiLEdBQUcsV0FBVyxDQUFBO1FBRWYsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRTtZQUNwQyxFQUFFO1lBQ0YsTUFBTTtZQUNOLEtBQUs7WUFDTCxFQUFFO1lBQ0YsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUMsQ0FBQTtRQUVGLCtDQUErQztRQUMvQywrRUFBK0U7UUFFL0UsNkJBQTZCO1FBQzdCLFFBQVEsTUFBTSxFQUFFLENBQUM7WUFDZixLQUFLLGdCQUFnQixFQUFFLFVBQVU7Z0JBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLHlCQUF5QixDQUFDLENBQUE7Z0JBQ25ELHdDQUF3QztnQkFDeEMsTUFBSztZQUNQLEtBQUssZ0JBQWdCLEVBQUUsVUFBVTtnQkFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUE7Z0JBQ3ZDLGdDQUFnQztnQkFDaEMsTUFBSztZQUNQLEtBQUssZ0JBQWdCLENBQUMs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