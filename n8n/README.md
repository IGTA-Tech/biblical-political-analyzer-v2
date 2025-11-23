# N8N Workflow Setup Guide

## 📋 Overview

This directory contains N8N workflow templates that power the Biblical Political Analyzer's backend processing.

## 🚀 Quick Setup

### 1. Import the Workflow

1. Log into your N8N instance: `https://igta.app.n8n.cloud`
2. Click **Workflows** in the left sidebar
3. Click **Import from File**
4. Select `master-workflow.json`
5. The workflow will be imported with all nodes

### 2. Configure Credentials

The workflow needs these credentials configured in N8N:

#### OpenAI API
- Go to **Settings** > **Credentials**
- Click **Add Credential** > **OpenAI**
- Enter your OpenAI API key
- Test the connection

#### Anthropic (Claude) API
- Click **Add Credential** > **HTTP Header Auth**
- Header Name: `x-api-key`
- Header Value: Your Claude API key
- Name it: "Claude API"

#### Supabase
- Click **Add Credential** > **HTTP Header Auth**
- You'll need two:
  - **Supabase Read** (with ANON_KEY)
  - **Supabase Write** (with SERVICE_ROLE_KEY)

### 3. Set Environment Variables

In N8N, go to **Settings** > **Environment Variables** and add:

```
SUPABASE_URL=https://nraxsxvjjffgrmfukjqf.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLAUDE_API_KEY=your_claude_key
```

### 4. Activate the Workflow

1. Open the imported workflow
2. Click **Active** toggle in the top right
3. Copy the Webhook URL (it will be shown)
4. Update this URL in your Netlify environment variables as `N8N_WEBHOOK_URL`

## 🔄 How the Workflow Works

### Flow Overview

```
Webhook → Extract Data → Generate Embedding → Search Database →
→ Call Claude AI → Format Results → Save to Supabase → Respond
```

### Detailed Steps

1. **Webhook Trigger**: Receives political statement from frontend
2. **Extract Statement**: Parses the incoming data
3. **Generate Embedding**: Calls OpenAI to create vector embedding
4. **Process Embedding**: Formats embedding for database queries
5. **Search Biblical Passages**: Queries Supabase for relevant verses
6. **Search Historical Parallels**: Finds similar historical events
7. **Prepare Claude Prompt**: Constructs comprehensive prompt
8. **Claude AI Analysis**: Gets detailed analysis from Claude
9. **Format Results**: Structures the response
10. **Save to Supabase**: Stores analysis in database
11. **Webhook Response**: Returns success to frontend

## 🧪 Testing the Workflow

### Manual Test

1. In N8N, open the workflow
2. Click **Execute Workflow** button
3. Go to the Webhook Trigger node
4. Click **Test URL**
5. Send a POST request:

```bash
curl -X POST https://your-n8n-url/webhook/analyze-political-statement \
  -H "Content-Type: application/json" \
  -d '{
    "political_statement": "We need to help the poor and needy",
    "user_id": "test-user"
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "Analysis complete"
}
```

## 🐛 Troubleshooting

### Workflow Not Triggering

- Check that workflow is **Active**
- Verify webhook URL matches what's in Netlify env vars
- Check N8N execution logs for errors

### OpenAI Errors

- Verify API key is correct
- Check you have API credits
- Ensure model name is correct: `text-embedding-ada-002`

### Supabase Errors

- Verify URL and keys are correct
- Check that database tables exist
- Ensure RLS policies allow operations
- Test Supabase connection in N8N credential settings

### Claude Errors

- Verify API key format (should start with `sk-ant-`)
- Check API version: `2023-06-01`
- Ensure model is available: `claude-3-sonnet-20240229`
- Check you have API credits

## 📊 Monitoring

### Check Executions

1. Go to **Executions** in N8N
2. See all workflow runs
3. Click any execution to see detailed logs
4. Green = success, Red = failed

### Common Issues

**Timeout Errors**: Increase timeout in HTTP Request nodes
**Rate Limiting**: Add delays between API calls
**Memory Issues**: Process data in smaller batches

## 🔧 Customization

### Adjust Search Results

In "Search Biblical Passages" node, change:
- `match_count`: Number of verses to return (default: 10)
- `match_threshold`: Minimum similarity score (default: 0.5)

### Modify Claude Prompt

Edit the "Prepare Claude Prompt" node's function to customize:
- Analysis structure
- Theological focus
- Detail level
- Response format

### Add More Data Sources

You can add additional nodes to query:
- News APIs
- Government data
- Project 2025 database
- Etymology dictionaries

## 📝 Workflow Maintenance

### Regular Updates

- Update model versions as new ones release
- Monitor API costs
- Review and optimize slow nodes
- Check for N8N platform updates

### Backup

Export workflow regularly:
1. Open workflow
2. Click **...** menu
3. Select **Download**
4. Save JSON file

## 🎯 Next Steps

After setup:
1. ✅ Import and activate workflow
2. ✅ Configure all credentials
3. ✅ Test with sample data
4. ✅ Update frontend with webhook URL
5. ✅ Monitor first real analyses
6. ✅ Fine-tune based on results

## 📞 Support

If issues persist:
- Check N8N community forum
- Review execution logs carefully
- Test each node individually
- Verify all credentials and env vars

---

**Your N8N workflow is ready to process Biblical political analyses! 🎉**
