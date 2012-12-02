require 'ruble'

command 'Full TiShadow Build' do |cmd|
  cmd.key_binding = 'SHIFT+CTRL+S'
  cmd.output = :output_to_console
  cmd.working_directory = :current_project
  cmd.invoke = "tishadow run"
end

command 'TiShadow Build Update' do |cmd|
  cmd.key_binding = 'CTRL+S'
  cmd.input = :none
  cmd.output = :output_to_console
  #Auto update on save currently not working...
  #cmd.trigger = :execution_listener, "org.eclipse.ui.file.save"
  cmd.working_directory = :current_project
  cmd.invoke = "tishadow run --update"
end

command 'Open TiShadow Webpage' do |cmd|
  cmd.key_binding = 'ALT+CTRL+S'
  cmd.output = :output_to_console
  cmd.invoke do |context|
    context.browser.open("http://localhost:3000", :browser => :default)  
  end
end
