require 'ruble'

snippet "exports for app" do |snip|
  snip.trigger = "tiexport"
  snip.expansion = """if (exports) {
  exports.close = function() {
    ${1:close_content}
  }; 
}"""
end

# Use Commands > Bundle Development > Insert Bundle Section > Snippet
# to easily add new snippets
